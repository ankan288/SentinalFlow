"""
test_e2e.py — End-to-End Test Suite for SentinelFlow (E2E-01 through E2E-18).

Validates the complete security pipeline across all trust boundaries:
1. Ingestion & Schema Validation (TB-2, C-01, C-10)
2. Deterministic Detection (TB-3, C-03)
3. Attack Chain Correlation (C-03)
4. Evidence Assembly & Anti-Fabrication (C-04)
5. Grounded AI Investigation (TB-4, C-02, C-05)
6. Cedar Policy Authorization (TB-5, C-06, C-07)
7. Human Approval Gate (TB-6, C-08)
8. Simulated Safe Remediation Execution
9. Append-Only Audit Trail (C-09)
10. Negative Attack & Boundary Resilience Scenarios
"""

from __future__ import annotations

import json
import os
import sys
import pytest
import jsonschema

# Ensure paths
TESTS_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(TESTS_DIR, "..", ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "detection", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "contracts", "authorization"))
sys.path.insert(0, os.path.join(REPO_ROOT, "ai-agent", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "backend", "src"))

from detector import run_all_rules, detect_brute_force, detect_credential_compromise
from correlation import correlate
from evidence import build_evidence_bundle, validate_no_fabrication, EvidenceBundle, EvidenceItem
from investigator import AIInvestigator
from authorizer import authorize
from audit_store import AppendOnlyAuditStore
from pipeline import SentinelFlowPipeline


EVENT_SCHEMA_PATH = os.path.join(REPO_ROOT, "contracts", "events", "security-event.schema.json")
AI_SCHEMA_PATH = os.path.join(REPO_ROOT, "contracts", "incidents", "ai-investigation.schema.json")
DEMO_DATA_PATH = os.path.join(REPO_ROOT, "shared", "demo", "sentinelflow-demo.json")


def _load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def event_schema():
    return _load_json(EVENT_SCHEMA_PATH)


@pytest.fixture
def ai_schema():
    return _load_json(AI_SCHEMA_PATH)


@pytest.fixture
def demo_dataset():
    return _load_json(DEMO_DATA_PATH)


# ==============================================================================
# E2E-01: Valid security event accepted
# ==============================================================================
def test_e2e_01_valid_security_event_accepted(event_schema, demo_dataset):
    event = demo_dataset["events"][0]
    # Validate against JSON schema
    jsonschema.validate(instance=event, schema=event_schema)
    assert event["event_id"] == "evt-demo00000001"
    assert event["event_type"] == "login_failed"


# ==============================================================================
# E2E-02: Invalid event rejected
# ==============================================================================
def test_e2e_02_invalid_event_rejected(event_schema):
    malformed_event = {
        "event_id": "invalid-id",
        # Missing required fields like timestamp, event_type, source_ip
    }
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.validate(instance=malformed_event, schema=event_schema)


# ==============================================================================
# E2E-03: Suspicious event detected
# ==============================================================================
def test_e2e_03_suspicious_event_detected(demo_dataset):
    events = demo_dataset["events"]
    detections = run_all_rules(events, sensitive_resources={"srv-grades-db"})
    rule_ids = {d.rule_id for d in detections}
    assert "RULE-001" in rule_ids
    assert "RULE-002" in rule_ids
    assert "RULE-003" in rule_ids
    assert "RULE-004" in rule_ids


# ==============================================================================
# E2E-04: Related events correlated
# ==============================================================================
def test_e2e_04_related_events_correlated(demo_dataset):
    events = demo_dataset["events"]
    detections = run_all_rules(events, sensitive_resources={"srv-grades-db"})
    chains = correlate(detections, incident_id="INC-0001")
    assert len(chains) == 1
    chain = chains[0]
    assert chain.incident_id == "INC-0001-1"
    assert chain.entities["user_id"] == "u-8823"
    assert chain.entities["source_ip"] == "203.0.113.77"
    assert len(chain.detections) == 4


# ==============================================================================
# E2E-05: Evidence generated
# ==============================================================================
def test_e2e_05_evidence_generated(demo_dataset):
    events = demo_dataset["events"]
    detections = run_all_rules(events, sensitive_resources={"srv-grades-db"})
    chains = correlate(detections, incident_id="INC-0001")
    bundle = build_evidence_bundle(chains[0].incident_id, chains[0].detections)
    
    assert len(bundle.items) >= 4
    known_event_ids = {e["event_id"] for e in events}
    fabrication_issues = validate_no_fabrication(bundle, known_event_ids)
    assert len(fabrication_issues) == 0


# ==============================================================================
# E2E-06: AI investigation generated and validated
# ==============================================================================
def test_e2e_06_ai_investigation_generated_and_validated(ai_schema, demo_dataset):
    events = demo_dataset["events"]
    detections = run_all_rules(events, sensitive_resources={"srv-grades-db"})
    chains = correlate(detections, incident_id="INC-0001")
    bundle = build_evidence_bundle(chains[0].incident_id, chains[0].detections)
    known_event_ids = {e["event_id"] for e in events}
    
    investigator = AIInvestigator(use_bedrock=False)
    result = investigator.investigate(
        bundle=bundle,
        known_event_ids=known_event_ids,
        asset_context={"asset_id": "srv-grades-db", "criticality": "high"},
        force_mock=True,
    )
    
    # Must pass schema validation
    jsonschema.validate(instance=result, schema=ai_schema)
    assert result["incident_id"] == chains[0].incident_id
    assert result["severity"] in ["critical", "high", "medium", "low", "info"]
    assert len(result["recommended_actions"]) > 0


# ==============================================================================
# E2E-07: Evidence references validated
# ==============================================================================
def test_e2e_07_evidence_references_validated(demo_dataset):
    events = demo_dataset["events"]
    detections = run_all_rules(events, sensitive_resources={"srv-grades-db"})
    chains = correlate(detections, incident_id="INC-0001")
    bundle = build_evidence_bundle(chains[0].incident_id, chains[0].detections)
    known_event_ids = {e["event_id"] for e in events}
    
    investigator = AIInvestigator(use_bedrock=False)
    result = investigator.investigate(
        bundle=bundle,
        known_event_ids=known_event_ids,
        force_mock=True,
    )
    
    # Verify all cited evidence IDs exist in bundle
    bundle_evidence_ids = {i.evidence_id for i in bundle.items}
    for action in result["recommended_actions"]:
        for ref in action.get("evidence_refs", []):
            assert ref in bundle_evidence_ids


# ==============================================================================
# E2E-08: Authorized read request succeeds
# ==============================================================================
def test_e2e_08_authorized_read_request_succeeds():
    context = {
        "approved_by_analyst": False,
        "approved_by_admin": False,
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "low",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_resp = authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001-1"',
        context=context,
    )
    assert auth_resp.is_allowed is True
    assert auth_resp.decision == "ALLOW"


# ==============================================================================
# E2E-09: Unauthorized request denied
# ==============================================================================
def test_e2e_09_unauthorized_request_denied():
    context = {
        "approved_by_analyst": False,
        "approved_by_admin": False,
        "request_source": "external_api",
        "mfa_authenticated": False,
        "risk_level": "low",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_resp = authorize(
        principal='SentinelFlow::User::"unauthorized_user"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001-1"',
        context=context,
    )
    assert auth_resp.is_allowed is False
    assert auth_resp.decision == "DENY"


# ==============================================================================
# E2E-10: Prompt injection does not alter authorization
# ==============================================================================
def test_e2e_10_prompt_injection_does_not_alter_authorization():
    # Injected prompt inside untrusted metadata or context
    context = {
        "approved_by_analyst": False,
        "approved_by_admin": False,
        "request_source": "malicious_payload_role_admin_override",
        "mfa_authenticated": False,
        "risk_level": "high",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_resp = authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-003"',
        context=context,
    )
    assert auth_resp.is_allowed is False
    assert auth_resp.decision == "DENY"


# ==============================================================================
# E2E-11: AI cannot directly execute high-risk remediation
# ==============================================================================
def test_e2e_11_ai_cannot_directly_execute_remediation():
    context = {
        "approved_by_analyst": True,
        "approved_by_admin": True,
        "request_source": "ai_agent_internal",
        "mfa_authenticated": False,
        "risk_level": "high",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_resp = authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-003"',
        context=context,
    )
    assert auth_resp.is_allowed is False
    assert auth_resp.decision == "DENY"


# ==============================================================================
# E2E-12: Human approval is required where defined
# ==============================================================================
def test_e2e_12_human_approval_is_required_where_defined():
    # Analyst attempts to execute medium-risk action WITHOUT approval
    context_unapproved = {
        "approved_by_analyst": False,
        "approved_by_admin": False,
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "medium",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_unapproved = authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context_unapproved,
    )
    assert auth_unapproved.is_allowed is False

    # WITH approval
    context_approved = {
        "approved_by_analyst": True,
        "approved_by_admin": False,
        "approval_timestamp": "2026-03-12T09:48:00.000Z",
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "medium",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_approved = authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context_approved,
    )
    assert auth_approved.is_allowed is True


# ==============================================================================
# E2E-13: Unauthorized approval attempt denied
# ==============================================================================
def test_e2e_13_unauthorized_approval_attempt_denied():
    # Analyst attempting to execute HIGH risk action (which requires Admin + MFA)
    context = {
        "approved_by_analyst": True,
        "approved_by_admin": False,
        "approval_timestamp": "2026-03-12T09:48:00.000Z",
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "high",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }
    auth_resp = authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-003"',
        context=context,
    )
    assert auth_resp.is_allowed is False
    assert auth_resp.decision == "DENY"


# ==============================================================================
# E2E-14: Cross-incident access denied
# ==============================================================================
def test_e2e_14_cross_incident_access_denied():
    # Attempting remediation where target does NOT match the incident
    context = {
        "approved_by_analyst": True,
        "approved_by_admin": False,
        "approval_timestamp": "2026-03-12T09:48:00.000Z",
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "medium",
        "target_matches_incident": False,
        "incident_id": "INC-0001-1",
    }
    auth_resp = authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert auth_resp.is_allowed is False
    assert auth_resp.decision == "DENY"


# ==============================================================================
# E2E-15: Audit record generated
# ==============================================================================
def test_e2e_15_audit_record_generated():
    store = AppendOnlyAuditStore()
    record = store.record_decision(
        principal='SentinelFlow::User::"analyst_jordan"',
        action="execute_remediation",
        resource="ACT-001",
        decision="ALLOW",
        incident_id="INC-0001-1",
        context={"risk_level": "medium"},
        reasons=["policy2"],
    )
    assert record["audit_id"].startswith("aud-")
    assert record["decision"] == "ALLOW"
    
    incident_logs = store.get_records(incident_id="INC-0001-1")
    assert len(incident_logs) == 1
    assert incident_logs[0]["audit_id"] == record["audit_id"]


# ==============================================================================
# E2E-16: Malformed AI output rejected
# ==============================================================================
def test_e2e_16_malformed_ai_output_rejected(ai_schema):
    malformed_output = {
        "incident_id": "INC-0001-1",
        "attack_stage": "invalid_stage_name",  # Violates enum
        "severity": "CRITICAL",
        "confidence": "high",
        "investigation_summary": "Summary text",
        "key_findings": [],
        "recommended_actions": [],
    }
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.validate(instance=malformed_output, schema=ai_schema)


# ==============================================================================
# E2E-17: Authorization failure fails closed
# ==============================================================================
def test_e2e_17_authorization_failure_fails_closed():
    # Pass empty or invalid context dict
    auth_resp = authorize(
        principal='SentinelFlow::User::"unknown_actor"',
        action='SentinelFlow::Action::"unknown_action"',
        resource='SentinelFlow::Incident::"INC-0001-1"',
        context={},
    )
    assert auth_resp.is_allowed is False
    assert auth_resp.decision == "DENY"


# ==============================================================================
# E2E-18: Complete canonical scenario succeeds
# ==============================================================================
def test_e2e_18_complete_canonical_scenario_succeeds(demo_dataset):
    pipeline = SentinelFlowPipeline()
    events = demo_dataset["events"]
    
    results = pipeline.process_events(
        raw_events=events,
        actor_principal='SentinelFlow::User::"analyst_jordan"',
        analyst_approved=True,
        admin_approved=False,
        mfa_authenticated=False,
    )
    
    assert results["status"] == "SUCCESS"
    assert results["stages"]["ingestion"]["validated_count"] == 31
    assert results["stages"]["detection"]["detection_count"] == 4
    assert results["stages"]["correlation"]["incident_id"] == "INC-0001-1"
    assert results["stages"]["evidence"]["anti_fabrication_check"] == "PASSED"
    assert len(results["stages"]["ai_investigation"]["recommended_actions"]) == 3
    assert len(results["stages"]["authorization"]) == 3
    assert len(results["stages"]["remediation"]) == 3
    assert len(results["audit_trail"]) == 3
