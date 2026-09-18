"""
authorizer.py — AWS Cedar authorization gateway for SentinelFlow (TB-5).

Evaluates access requests against formal Cedar policies and schema.
Implements Default Deny, Fail-Closed error handling, and audit logging.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

import jsonschema

try:
    import cedarpy
except ImportError:
    cedarpy = None

logger = logging.getLogger("sentinelflow.authorizer")

CURRENT_DIR = os.path.dirname(__file__)
POLICIES_PATH = os.path.join(CURRENT_DIR, "policies.cedar")
SCHEMA_PATH = os.path.join(CURRENT_DIR, "sentinelflow.cedarschema.json")
CONTEXT_SCHEMA_PATH = os.path.join(CURRENT_DIR, "authorization-context.schema.json")


def _load_file_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _load_file_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@dataclass
class AuthorizationDecision:
    decision: str  # "ALLOW" or "DENY"
    principal: str
    action: str
    resource: str
    diagnostics: list[str] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)
    audit_record: dict = field(default_factory=dict)

    @property
    def is_allowed(self) -> bool:
        return self.decision.upper() == "ALLOW"


# Canonical entity hierarchy for SentinelFlow Cedar evaluation
DEFAULT_ENTITIES = [
    {
        "uid": {"type": "SentinelFlow::Role", "id": "SecurityAnalyst"},
        "attrs": {},
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::Role", "id": "SecurityAdmin"},
        "attrs": {},
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::Role", "id": "Auditor"},
        "attrs": {},
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::User", "id": "analyst_jordan"},
        "attrs": {
            "role": {"type": "SentinelFlow::Role", "id": "SecurityAnalyst"},
            "assigned_incidents": [{"type": "SentinelFlow::Incident", "id": "INC-0001"}],
        },
        "parents": [{"type": "SentinelFlow::Role", "id": "SecurityAnalyst"}],
    },
    {
        "uid": {"type": "SentinelFlow::User", "id": "admin_alex"},
        "attrs": {
            "role": {"type": "SentinelFlow::Role", "id": "SecurityAdmin"},
            "assigned_incidents": [],
        },
        "parents": [{"type": "SentinelFlow::Role", "id": "SecurityAdmin"}],
    },
    {
        "uid": {"type": "SentinelFlow::User", "id": "auditor_sam"},
        "attrs": {
            "role": {"type": "SentinelFlow::Role", "id": "Auditor"},
            "assigned_incidents": [],
        },
        "parents": [{"type": "SentinelFlow::Role", "id": "Auditor"}],
    },
    {
        "uid": {"type": "SentinelFlow::Service", "id": "ai_agent"},
        "attrs": {"service_name": "ai_investigator"},
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::Incident", "id": "INC-0001"},
        "attrs": {
            "incident_id": "INC-0001",
            "severity": "high",
            "status": "active",
        },
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::Evidence", "id": "INC-0001-EV"},
        "attrs": {
            "incident": {"type": "SentinelFlow::Incident", "id": "INC-0001"},
        },
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::Asset", "id": "srv-grades-db"},
        "attrs": {
            "asset_id": "srv-grades-db",
            "sensitivity": "high",
        },
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::ResponseAction", "id": "ACT-001"},
        "attrs": {
            "action_type": "disable_user_account",
            "risk_level": "medium",
            "incident": {"type": "SentinelFlow::Incident", "id": "INC-0001"},
        },
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::SecurityRule", "id": "RULE-001"},
        "attrs": {
            "rule_id": "RULE-001",
            "is_active": True,
        },
        "parents": [],
    },
    {
        "uid": {"type": "SentinelFlow::AuditLog", "id": "system_audit_log"},
        "attrs": {
            "log_type": "security_audit",
        },
        "parents": [],
    },
]


class CedarAuthorizer:
    """Cedar Authorization Gateway enforcing TB-5 security policy."""

    def __init__(
        self,
        policies_path: str = POLICIES_PATH,
        schema_path: str = SCHEMA_PATH,
        context_schema_path: str = CONTEXT_SCHEMA_PATH,
    ):
        self.policies_text = _load_file_text(policies_path)
        self.schema_json = _load_file_json(schema_path)
        self.context_schema = _load_file_json(context_schema_path)
        self.entities = list(DEFAULT_ENTITIES)

    def validate_context(self, context: dict) -> None:
        """Validate context payload against JSON schema before Cedar evaluation."""
        jsonschema.validate(instance=context, schema=self.context_schema)

    def authorize(
        self,
        principal: str,
        action: str,
        resource: str,
        context: dict,
        extra_entities: Optional[list[dict]] = None,
    ) -> AuthorizationDecision:
        """
        Evaluate an authorization request using AWS Cedar.
        Fails closed on malformed context, missing schema fields, or runtime errors.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        combined_entities = self.entities + (extra_entities or [])

        # 1. Context validation (Fail-Closed)
        try:
            self.validate_context(context)
        except Exception as e:
            return self._build_deny_result(
                principal,
                action,
                resource,
                reasons=[f"Context validation failure: {str(e)}"],
                timestamp=timestamp,
            )

        # 2. Cedar policy evaluation
        if cedarpy is None:
            return self._build_deny_result(
                principal,
                action,
                resource,
                reasons=["Cedar engine unavailable"],
                timestamp=timestamp,
            )

        try:
            # Cedar context rejects JSON nulls; omit optional keys that are None
            clean_context = {k: v for k, v in context.items() if v is not None}
            request = {
                "principal": principal,
                "action": action,
                "resource": resource,
                "context": clean_context,
            }
            authz_result = cedarpy.is_authorized(
                request=request,
                policies=self.policies_text,
                entities=combined_entities,
                schema=self.schema_json,
            )

            raw_decision = authz_result.decision.name.upper()
            decision_str = "ALLOW" if raw_decision == "ALLOW" else "DENY"
            reasons = [str(r) for r in authz_result.diagnostics.reasons]
            errors = [str(e) for e in authz_result.diagnostics.errors]

            audit_entry = {
                "timestamp": timestamp,
                "principal": principal,
                "action": action,
                "resource": resource,
                "decision": decision_str,
                "cedar_raw_decision": raw_decision,
                "reasons": reasons,
                "errors": errors,
                "request_source": context.get("request_source"),
                "risk_level": context.get("risk_level"),
            }

            return AuthorizationDecision(
                decision=decision_str,
                principal=principal,
                action=action,
                resource=resource,
                diagnostics=errors,
                reasons=reasons,
                audit_record=audit_entry,
            )

        except Exception as ex:
            # FAIL-CLOSED: Any exception evaluates strictly as DENY
            logger.error("Cedar evaluation exception: %s", ex, exc_info=True)
            return self._build_deny_result(
                principal,
                action,
                resource,
                reasons=[f"Cedar evaluation error: {str(ex)}"],
                timestamp=timestamp,
            )

    def _build_deny_result(
        self,
        principal: str,
        action: str,
        resource: str,
        reasons: list[str],
        timestamp: str,
    ) -> AuthorizationDecision:
        audit_entry = {
            "timestamp": timestamp,
            "principal": principal,
            "action": action,
            "resource": resource,
            "decision": "DENY",
            "reasons": reasons,
            "errors": reasons,
        }
        return AuthorizationDecision(
            decision="DENY",
            principal=principal,
            action=action,
            resource=resource,
            diagnostics=reasons,
            reasons=reasons,
            audit_record=audit_entry,
        )


# Global singleton instance
default_authorizer = CedarAuthorizer()


def authorize(
    principal: str,
    action: str,
    resource: str,
    context: dict,
    extra_entities: Optional[list[dict]] = None,
) -> AuthorizationDecision:
    """Convenience functional interface for SentinelFlow components."""
    return default_authorizer.authorize(principal, action, resource, context, extra_entities)
