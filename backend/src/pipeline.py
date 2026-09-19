"""
pipeline.py — End-to-End Security Pipeline Orchestrator for SentinelFlow.

Integrates all 8 lifecycle stages:
Ingest -> Detect -> Correlate -> Evidence -> Investigate -> Authorize -> Remediate -> Audit
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any, Optional

import jsonschema

# Ensure dependencies are discoverable
CURRENT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

PATHS_TO_ADD = [
    os.path.join(REPO_ROOT, "detection", "src"),
    os.path.join(REPO_ROOT, "contracts", "authorization"),
    os.path.join(REPO_ROOT, "ai-agent", "src"),
    os.path.join(REPO_ROOT, "backend", "src"),
]
for p in PATHS_TO_ADD:
    if p not in sys.path:
        sys.path.insert(0, p)

from detector import run_all_rules
from correlation import correlate
from evidence import build_evidence_bundle, validate_no_fabrication
from investigator import AIInvestigator
from authorizer import authorize as cedar_authorize
from audit_store import default_audit_store, AppendOnlyAuditStore

EVENT_SCHEMA_PATH = os.path.join(REPO_ROOT, "contracts", "events", "security-event.schema.json")


class SentinelFlowPipeline:
    """End-to-end security orchestration pipeline."""

    def __init__(self, audit_store: Optional[AppendOnlyAuditStore] = None) -> None:
        self.audit_store = audit_store or default_audit_store
        with open(EVENT_SCHEMA_PATH, "r", encoding="utf-8") as f:
            self.event_schema = json.load(f)

    def process_events(
        self,
        raw_events: list[dict[str, Any]],
        actor_principal: str = 'SentinelFlow::User::"analyst_jordan"',
        analyst_approved: bool = True,
        admin_approved: bool = False,
        mfa_authenticated: bool = False,
    ) -> dict[str, Any]:
        """Execute the complete 8-stage security lifecycle."""
        # STAGE 1: Ingestion & Deduplication (TB-2, C-01, C-10)
        validated_events = []
        rejected_count = 0
        seen_event_ids: set[str] = set()

        for ev in raw_events:
            event_id = ev.get("event_id")
            if not event_id or event_id in seen_event_ids:
                rejected_count += 1
                continue
            try:
                jsonschema.validate(instance=ev, schema=self.event_schema)
                seen_event_ids.add(event_id)
                validated_events.append(ev)
            except jsonschema.ValidationError:
                rejected_count += 1

        known_event_ids = {e["event_id"] for e in validated_events}

        # STAGE 2: Deterministic Detection (TB-3, C-03 - LLM Free)
        detections = run_all_rules(validated_events, sensitive_resources={"srv-grades-db"})
        detections_output = [
            {
                "rule_id": d.rule_id,
                "severity": d.severity,
                "type": d.detection_type,
                "entities": d.involved_entities,
                "related_events": d.related_event_ids,
            }
            for d in detections
        ]

        # STAGE 3: Attack Chain Correlation (C-03)
        chains = correlate(detections, incident_id="INC-0001")
        primary_chain = chains[0] if chains else None
        incident_id = primary_chain.incident_id if primary_chain else "INC-0001-1"
        chain_entities = primary_chain.entities if primary_chain else {}
        chain_detections = primary_chain.detections if primary_chain else detections

        # STAGE 4: Evidence Bundle & Anti-Fabrication (C-04)
        bundle = build_evidence_bundle(incident_id, chain_detections)
        fab_issues = validate_no_fabrication(bundle, known_event_ids)
        anti_fab_status = "PASSED" if not fab_issues else f"FAILED: {fab_issues}"

        items_output = [
            {"id": item.evidence_id, "statement": item.statement}
            for item in bundle.items
        ]

        # STAGE 5: AI Security Investigation Narrative (TB-4, C-02, C-05)
        investigator = AIInvestigator(use_bedrock=False)
        ai_res = investigator.investigate(
            bundle=bundle,
            known_event_ids=known_event_ids,
            asset_context={"asset_id": "srv-grades-db", "criticality": "high"},
            force_mock=True,
        )

        ai_stage = {
            "incident_id": ai_res["incident_id"],
            "attack_stage": ai_res["attack_stage"],
            "severity": ai_res["severity"],
            "confidence": ai_res["confidence"],
            "summary": ai_res["investigation_summary"],
            "investigation_summary": ai_res["investigation_summary"],
            "recommended_actions": ai_res["recommended_actions"],
        }

        # STAGE 6: AWS Cedar Authorization & Human Gate (TB-5, TB-6, C-06, C-08)
        auth_stage = []
        remediation_stage = []

        for act in ai_res["recommended_actions"]:
            context = {
                "approved_by_analyst": analyst_approved,
                "approved_by_admin": admin_approved,
                "approval_timestamp": "2026-03-12T09:48:10.000Z" if (analyst_approved or admin_approved) else None,
                "request_source": "analyst_ui",
                "mfa_authenticated": mfa_authenticated,
                "risk_level": act["risk_level"],
                "target_matches_incident": True,
                "incident_id": incident_id,
            }

            auth_resp = cedar_authorize(
                principal=actor_principal,
                action='SentinelFlow::Action::"execute_remediation"',
                resource=f'SentinelFlow::ResponseAction::"{act["action_id"]}"',
                context=context,
            )

            auth_stage.append({
                "action_id": act["action_id"],
                "action_type": act["action_type"],
                "risk_level": act["risk_level"],
                "is_allowed": auth_resp.is_allowed,
                "decision": auth_resp.decision,
                "reasons": auth_resp.reasons,
            })

            # STAGE 7: Simulated Remediation Execution (C-08)
            target_val = act.get("target_entity", {}).get("entity_value", "target")
            if auth_resp.is_allowed:
                rem_status = "EXECUTED_SIMULATED"
                rem_msg = f"Successfully performed simulated {act['action_type']} on {target_val}."
            else:
                rem_status = "BLOCKED_BY_POLICY"
                rem_msg = "Execution blocked: Cedar decision was DENY."

            remediation_stage.append({
                "action_id": act["action_id"],
                "status": rem_status,
                "message": rem_msg,
            })

            # STAGE 8: Append-Only Audit Trail (C-09)
            self.audit_store.record_decision(
                principal=actor_principal,
                action="execute_remediation",
                resource=act["action_id"],
                decision=auth_resp.decision,
                incident_id=incident_id,
                context=context,
                reasons=auth_resp.reasons,
            )

        audit_records = self.audit_store.get_records(incident_id=incident_id)

        return {
            "status": "SUCCESS",
            "stages": {
                "ingestion": {
                    "validated_count": len(validated_events),
                    "rejected_count": rejected_count,
                },
                "detection": {
                    "detection_count": len(detections),
                    "detections": detections_output,
                },
                "correlation": {
                    "incident_id": incident_id,
                    "entities": chain_entities,
                    "stages_count": len(chain_detections),
                },
                "evidence": {
                    "evidence_count": len(bundle.items),
                    "anti_fabrication_check": anti_fab_status,
                    "items": items_output,
                },
                "ai_investigation": ai_stage,
                "authorization": auth_stage,
                "remediation": remediation_stage,
            },
            "audit_trail": audit_records,
        }
