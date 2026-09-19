"""
authorization_test.py — Verification script for Phase 7: Authorization, Human Approval, Remediation.

Executes and verifies all 7 authorization security test cases:
(a) Allowed low/medium action
(b) High-risk action requiring approval
(c) AI attempting direct execution
(d) Unauthorized analyst attempting action
(e) Wrong target/incident
(f) Missing approval
(g) Invalid action
"""

from __future__ import annotations

import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "contracts", "authorization"))

from authorizer import authorize, CedarAuthorizer


def run_phase_7_authorization_tests():
    print("=" * 80)
    print("  PHASE 7: AWS CEDAR AUTHORIZATION, HUMAN APPROVAL & REMEDIATION VERIFICATION")
    print("=" * 80)

    authz = CedarAuthorizer()

    base_context = {
        "approved_by_analyst": False,
        "approved_by_admin": False,
        "approval_timestamp": None,
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "medium",
        "target_matches_incident": True,
        "incident_id": "INC-0001-1",
    }

    results = []

    # (a) Allowed low/medium action (Analyst approved)
    ctx_a = dict(base_context, approved_by_analyst=True, risk_level="medium")
    dec_a = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=ctx_a
    )
    results.append(("a) Allowed Low/Medium Action", dec_a.decision == "ALLOW", dec_a.decision, dec_a.reasons))

    # (b) High-risk action requiring approval (Analyst denied; Admin+MFA allowed)
    ctx_b_analyst = dict(base_context, approved_by_analyst=True, risk_level="high")
    dec_b_analyst = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-003"',
        context=ctx_b_analyst
    )

    ctx_b_admin = dict(base_context, approved_by_admin=True, mfa_authenticated=True, request_source="admin_console", risk_level="high")
    dec_b_admin = authz.authorize(
        principal='SentinelFlow::User::"admin_alex"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-003"',
        context=ctx_b_admin
    )
    b_passed = (dec_b_analyst.decision == "DENY") and (dec_b_admin.decision == "ALLOW")
    results.append(("b) High-Risk Action Approval Requirement", b_passed, f"Analyst={dec_b_analyst.decision}, Admin={dec_b_admin.decision}", dec_b_analyst.reasons))

    # (c) AI attempting direct execution
    ctx_c = dict(base_context, approved_by_analyst=True, request_source="ai_agent_service", risk_level="medium")
    dec_c = authz.authorize(
        principal='SentinelFlow::Service::"ai_agent"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=ctx_c
    )
    results.append(("c) AI Direct Execution Attempt", dec_c.decision == "DENY", dec_c.decision, dec_c.reasons))

    # (d) Unauthorized analyst / guest attempting action
    ctx_d = dict(base_context, approved_by_analyst=True)
    dec_d = authz.authorize(
        principal='SentinelFlow::User::"untrusted_guest_user"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=ctx_d
    )
    results.append(("d) Unauthorized Actor Attempt", dec_d.decision == "DENY", dec_d.decision, dec_d.reasons))

    # (e) Wrong target/incident (target mismatch)
    ctx_e = dict(base_context, approved_by_analyst=True, target_matches_incident=False)
    dec_e = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=ctx_e
    )
    results.append(("e) Target / Incident Mismatch", dec_e.decision == "DENY", dec_e.decision, dec_e.reasons))

    # (f) Missing required approval
    ctx_f = dict(base_context, approved_by_analyst=False, risk_level="medium")
    dec_f = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=ctx_f
    )
    results.append(("f) Missing Human Approval", dec_f.decision == "DENY", dec_f.decision, dec_f.reasons))

    # (g) Invalid / unknown action
    ctx_g = dict(base_context)
    dec_g = authz.authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"arbitrary_unmodeled_action"',
        resource='SentinelFlow::Incident::"INC-0001-1"',
        context=ctx_g
    )
    results.append(("g) Invalid / Unmodeled Action", dec_g.decision == "DENY", dec_g.decision, dec_g.reasons))

    # Print Report Table
    print(f"\n{'Test Case':<45} | {'Decision':<20} | {'Status':<8}")
    print("-" * 80)
    for test_name, passed, decision_str, reasons in results:
        status_label = "PASS" if passed else "FAIL"
        print(f"{test_name:<45} | {decision_str:<20} | {status_label:<8}")

    all_passed = all(p for _, p, _, _ in results)
    print(f"\n[+] Phase 7 Verification Status: {'PASS' if all_passed else 'FAIL'}")
    return all_passed


if __name__ == "__main__":
    run_phase_7_authorization_tests()
