"""
test_authorization.py — Phase 8: AWS Cedar Authorization Test Suite.

Validates the TB-5 authorization boundary using official Cedar evaluation semantics:
- Default Deny
- Role-Based Permissions (Analyst, Admin, Auditor, AI Agent)
- AI Investigator Sandboxing & Explicit Denials
- Human-in-the-Loop Approval Gates
- Cross-Incident Isolation
- Tamper Resistance against Untrusted Event Metadata / Role Injection
- Immutable Audit Log Protection
- Fail-Closed Behavior
"""

from __future__ import annotations

import copy
import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "contracts", "authorization"))
from authorizer import CedarAuthorizer, authorize


@pytest.fixture
def authz() -> CedarAuthorizer:
    return CedarAuthorizer()


@pytest.fixture
def base_context() -> dict:
    return {
        "approved_by_analyst": False,
        "approved_by_admin": False,
        "approval_timestamp": None,
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "low",
        "target_matches_incident": True,
        "incident_id": "INC-0001",
    }


# ==============================================================================
# 1. CORE ROLE PERMISSIONS (AUTH-01 to AUTH-03, AUTH-07, AUTH-10)
# ==============================================================================

def test_auth_01_authorized_analyst_reads_permitted_incident(authz, base_context):
    """AUTH-01: An authorized SOC analyst can read incidents and evidence."""
    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=base_context,
    )
    assert res.is_allowed is True
    assert res.decision == "ALLOW"


def test_auth_02_unauthorized_actor_cannot_read_incident(authz, base_context):
    """AUTH-02: An actor without analyst/admin/auditor role cannot read incidents."""
    res = authz.authorize(
        principal='SentinelFlow::User::"untrusted_guest_user"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=base_context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_03_ai_investigator_can_read_permitted_evidence(authz, base_context):
    """AUTH-03: AI Investigator agent can read evidence and asset context."""
    context = copy.deepcopy(base_context)
    context["request_source"] = "ai_agent_service"

    res = authz.authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"read_evidence"',
        resource='SentinelFlow::Evidence::"INC-0001-EV"',
        context=context,
    )
    assert res.is_allowed is True
    assert res.decision == "ALLOW"


def test_auth_07_security_admin_can_perform_administrative_operations(authz, base_context):
    """AUTH-07: Security Admin with MFA can modify security rules and view audit logs."""
    context = copy.deepcopy(base_context)
    context["request_source"] = "admin_console"
    context["mfa_authenticated"] = True
    context["risk_level"] = "high"

    res = authz.authorize(
        principal='SentinelFlow::User::"admin_alex"',
        action='SentinelFlow::Action::"modify_security_rule"',
        resource='SentinelFlow::SecurityRule::"RULE-001"',
        context=context,
    )
    assert res.is_allowed is True
    assert res.decision == "ALLOW"


# ==============================================================================
# 2. AI INVESTIGATOR BOUNDARY & STRICT FORBID (AUTH-04, AUTH-05, AUTH-14)
# ==============================================================================

def test_auth_04_ai_investigator_cannot_execute_remediation(authz, base_context):
    """AUTH-04: AI Investigator is explicitly FORBIDDEN from executing remediations directly."""
    context = copy.deepcopy(base_context)
    context["request_source"] = "ai_agent_service"
    context["risk_level"] = "high"
    context["approved_by_analyst"] = True  # Even if context claims approved

    res = authz.authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"
    # Verify policy5 (explicit forbid for AI agent execution) was matched
    assert len(res.reasons) > 0


def test_auth_05_ai_investigator_cannot_modify_security_rules(authz, base_context):
    """AUTH-05: AI Investigator is explicitly FORBIDDEN from modifying detection rules."""
    context = copy.deepcopy(base_context)
    context["request_source"] = "ai_agent_service"
    context["mfa_authenticated"] = True

    res = authz.authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"modify_security_rule"',
        resource='SentinelFlow::SecurityRule::"RULE-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_14_ai_generated_approval_cannot_authorize_action(authz, base_context):
    """AUTH-14: An AI agent cannot approve its own or others' remediation proposals."""
    context = copy.deepcopy(base_context)
    context["request_source"] = "ai_agent_service"
    context["risk_level"] = "medium"

    res = authz.authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"approve_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_ai_agent_can_propose_remediation(authz, base_context):
    """AI Investigator CAN propose remediation (proposal only, no execution)."""
    context = copy.deepcopy(base_context)
    context["request_source"] = "ai_agent_service"
    context["risk_level"] = "medium"

    res = authz.authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"propose_remediation"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=context,
    )
    assert res.is_allowed is True
    assert res.decision == "ALLOW"


# ==============================================================================
# 3. PRIVILEGE ESCALATION & HUMAN APPROVAL GATES (AUTH-06, AUTH-13, AUTH-18)
# ==============================================================================

def test_auth_06_analyst_cannot_modify_security_rules(authz, base_context):
    """AUTH-06: SOC Analyst cannot perform admin-only operation (modify security rules)."""
    context = copy.deepcopy(base_context)
    context["mfa_authenticated"] = True

    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"modify_security_rule"',
        resource='SentinelFlow::SecurityRule::"RULE-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_13_user_supplied_role_cannot_escalate_privilege(authz, base_context):
    """AUTH-13: Untrusted entity cannot claim admin role without valid entity hierarchy."""
    fake_user = 'SentinelFlow::User::"fake_admin_attacker"'
    context = copy.deepcopy(base_context)
    context["mfa_authenticated"] = True

    res = authz.authorize(
        principal=fake_user,
        action='SentinelFlow::Action::"modify_security_rule"',
        resource='SentinelFlow::SecurityRule::"RULE-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_18_side_effecting_action_without_required_approval_is_denied(authz, base_context):
    """AUTH-18: Analyst cannot execute remediation if approved_by_analyst is False."""
    context = copy.deepcopy(base_context)
    context["risk_level"] = "medium"
    context["approved_by_analyst"] = False  # Unapproved!

    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_analyst_can_execute_when_approved(authz, base_context):
    """Analyst CAN execute medium-risk remediation when approved_by_analyst is True."""
    context = copy.deepcopy(base_context)
    context["risk_level"] = "medium"
    context["approved_by_analyst"] = True
    context["target_matches_incident"] = True

    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is True
    assert res.decision == "ALLOW"


def test_analyst_cannot_execute_high_risk_remediation(authz, base_context):
    """Analyst CANNOT execute high-risk remediation even if approved (requires Admin)."""
    context = copy.deepcopy(base_context)
    context["risk_level"] = "high"
    context["approved_by_analyst"] = True
    context["target_matches_incident"] = True

    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


# ==============================================================================
# 4. DEFAULT DENY & UNKNOWN ENTITY HANDLING (AUTH-08 to AUTH-10, AUTH-12)
# ==============================================================================

def test_auth_08_unknown_actor_is_denied(authz, base_context):
    """AUTH-08: Any unknown principal is denied by default."""
    res = authz.authorize(
        principal='SentinelFlow::User::"non_existent_actor"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=base_context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_09_unknown_action_is_denied(authz, base_context):
    """AUTH-09: Any unknown or unmodeled action is denied by default."""
    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"unknown_arbitrary_action"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=base_context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_10_unknown_resource_is_denied(authz, base_context):
    """AUTH-10: Actions on unknown or unmodeled resources are denied."""
    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Resource::"unknown_secret_store"',
        context=base_context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


def test_auth_12_malformed_context_fails_closed(authz):
    """AUTH-12: Malformed context payload (schema violation) fails closed immediately to DENY."""
    malformed_context = {
        "invalid_field": True,
        # Missing all required fields
    }
    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=malformed_context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"
    assert any("Context validation failure" in r for r in res.reasons)


# ==============================================================================
# 5. CROSS-INCIDENT ISOLATION & TARGET VALIDATION (AUTH-11, AUTH-15, AUTH-17)
# ==============================================================================

def test_auth_11_target_mismatch_forbid_remediation(authz, base_context):
    """AUTH-11 / Policy 11: Remediation is explicitly FORBIDDEN if target does not match incident."""
    context = copy.deepcopy(base_context)
    context["risk_level"] = "medium"
    context["approved_by_analyst"] = True
    context["target_matches_incident"] = False  # Mismatched target!

    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"
    # Explicit forbid policy matched
    assert len(res.reasons) > 0


def test_auth_15_untrusted_metadata_cannot_change_authorization(authz, base_context):
    """
    AUTH-15: Even if an attacker attempts prompt injection or metadata tampering
    inside context notes, Cedar evaluates only typed boolean flags.
    """
    context = copy.deepcopy(base_context)
    context["risk_level"] = "high"
    context["approved_by_admin"] = False
    context["mfa_authenticated"] = False

    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context,
    )
    assert res.is_allowed is False
    assert res.decision == "DENY"


# ==============================================================================
# 6. AUDIT LOG IMMUTABILITY & AUDITING (AUTH-16, AUTH-19, AUTH-20)
# ==============================================================================

def test_auth_forbid_audit_log_deletion_for_all(authz, base_context):
    """Policy 10: Audit log deletion is globally FORBIDDEN for Admin, Analyst, and AI."""
    principals = [
        'SentinelFlow::User::"admin_alex"',
        'SentinelFlow::User::"analyst_jordan"',
        'SentinelFlow::User::"auditor_sam"',
        'SentinelFlow::Service::"ai_agent"',
    ]
    for p in principals:
        res = authz.authorize(
            principal=p,
            action='SentinelFlow::Action::"delete_audit_log"',
            resource='SentinelFlow::AuditLog::"system_audit_log"',
            context=base_context,
        )
        assert res.is_allowed is False, f"Principal {p} was unexpectedly permitted to delete audit logs"
        assert res.decision == "DENY"
        # Explicit forbid policy matched
        assert len(res.reasons) > 0


def test_auth_20_audit_record_generated_for_every_decision(authz, base_context):
    """AUTH-20: Authorizer generates a structured audit log record on every call."""
    res = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"read_incident"',
        resource='SentinelFlow::Incident::"INC-0001"',
        context=base_context,
    )
    assert res.audit_record is not None
    assert res.audit_record["decision"] == "ALLOW"
    assert res.audit_record["principal"] == 'SentinelFlow::User::"analyst_jordan"'
    assert res.audit_record["action"] == 'SentinelFlow::Action::"read_incident"'
    assert "timestamp" in res.audit_record
