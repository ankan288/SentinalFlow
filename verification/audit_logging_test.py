"""
audit_logging_test.py — Verification script for Phase 8: Audit Logging & Immutability.

Verifies:
1. Audit record completeness (actor, action, target, decision, timestamp, incident_id, reasons).
2. Append-Only store immutability (delete_records raises PermissionError).
3. Cedar Policy 10 immutability enforcement (delete_audit_log returns DENY for all principals).
"""

from __future__ import annotations

import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "backend", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "contracts", "authorization"))

from audit_store import AppendOnlyAuditStore
from authorizer import authorize, CedarAuthorizer


def run_phase_8_audit_tests():
    print("=" * 80)
    print("  PHASE 8: AUDIT LOGGING & IMMUTABILITY VERIFICATION")
    print("=" * 80)

    # 1. Audit Record Field Completeness
    store = AppendOnlyAuditStore()
    record = store.record_decision(
        principal='SentinelFlow::User::"analyst_jordan"',
        action="execute_remediation",
        resource="ACT-001",
        decision="ALLOW",
        incident_id="INC-0008-1",
        context={"risk_level": "medium"},
        reasons=["policy2"],
    )

    required_fields = ["audit_id", "timestamp", "principal", "action", "resource", "decision", "incident_id", "context", "reasons"]
    missing = [f for f in required_fields if f not in record]
    
    print("\n[1] Audit Record Field Integrity Check:")
    print(f"    Record Audit ID: {record['audit_id']}")
    print(f"    Timestamp: {record['timestamp']}")
    print(f"    Principal (Actor): {record['principal']}")
    print(f"    Action: {record['action']}")
    print(f"    Resource (Target): {record['resource']}")
    print(f"    Decision: {record['decision']}")
    print(f"    Incident ID: {record['incident_id']}")
    print(f"    Missing Fields: {missing}")
    assert not missing, f"Audit record missing required fields: {missing}"
    print("    Record Completeness: PASS")

    # 2. Immutability Enforcement (Python Store Level)
    print("\n[2] Store Immutability Attempt (delete_records):")
    try:
        store.delete_records(incident_id="INC-0008-1")
        assert False, "FAIL: delete_records did not raise PermissionError!"
    except PermissionError as exc:
        print(f"    Caught Expected Exception: {exc}")
        print("    Store Immutability: PASS")

    # 3. Immutability Enforcement (Cedar Policy Level)
    print("\n[3] Cedar Policy Immutability Enforcement (delete_audit_log):")
    authz = CedarAuthorizer()
    principals = [
        'SentinelFlow::User::"admin_alex"',
        'SentinelFlow::User::"analyst_jordan"',
        'SentinelFlow::User::"auditor_sam"',
        'SentinelFlow::Service::"ai_agent"',
    ]

    context = {
        "approved_by_analyst": False,
        "approved_by_admin": True,
        "mfa_authenticated": True,
        "request_source": "admin_console",
        "risk_level": "high",
        "target_matches_incident": True,
        "incident_id": "INC-0008-1",
    }

    cedar_pass = True
    for p in principals:
        dec = authz.authorize(
            principal=p,
            action='SentinelFlow::Action::"delete_audit_log"',
            resource='SentinelFlow::AuditLog::"system_audit_log"',
            context=context,
        )
        print(f"    Attempt by {p:<40} -> Decision: {dec.decision}")
        if dec.decision != "DENY":
            cedar_pass = False

    assert cedar_pass, "FAIL: Cedar permitted audit log deletion!"
    print("    Cedar Audit Log Protection: PASS")

    print("\n[+] Phase 8 Verification Status: PASS")


if __name__ == "__main__":
    run_phase_8_audit_tests()
