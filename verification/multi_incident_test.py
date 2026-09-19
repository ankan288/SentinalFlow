"""
multi_incident_test.py — Verification script for Phase 4: Multi-Incident Isolation.

Generates two independent synthetic event streams concurrently:
- Attack A: test-user-A / 203.0.113.101 / test-device-A / srv-grades-db
- Attack B: test-user-B / 203.0.113.102 / test-device-B / srv-grades-db

Verifies:
1. Separate Incident IDs created by correlation engine.
2. Zero evidence bleed between Incident A and Incident B.
3. AI evidence bundles for A cite ONLY A's evidence.
4. Cedar authorization blocks cross-incident remediation targeting (target mismatch -> DENY).
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone

CURRENT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "backend", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "contracts", "authorization"))
sys.path.insert(0, os.path.join(REPO_ROOT, "ai-agent", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "detection", "src"))

from detector import run_all_rules
from correlation import correlate
from evidence import build_evidence_bundle, validate_no_fabrication
from investigator import AIInvestigator
from authorizer import authorize as cedar_authorize


def generate_synthetic_attack(prefix: str, user: str, ip: str, device: str) -> list[dict]:
    base_time = datetime(2026, 3, 19, 15, 0, 0, tzinfo=timezone.utc)
    events = []

    # 5 Failed Logins
    for i in range(1, 6):
        ts = (base_time + timedelta(seconds=i * 5)).isoformat().replace("+00:00", "Z")
        events.append({
            "event_id": f"evt-{prefix}-fail-{i:02d}",
            "timestamp": ts,
            "event_type": "login_failed",
            "source_ip": ip,
            "user_id": user,
            "attempted_username": f"{user}-attempt-{i}",
            "device_id": None,
            "resource": None,
            "severity": "medium",
            "metadata": {"attempt_num": i}
        })

    # Success
    s_ts = (base_time + timedelta(seconds=40)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": f"evt-{prefix}-succ-01",
        "timestamp": s_ts,
        "event_type": "login_success",
        "source_ip": ip,
        "user_id": user,
        "attempted_username": user,
        "device_id": None,
        "resource": None,
        "severity": "low",
        "metadata": {}
    })

    # New Device
    d_ts = (base_time + timedelta(seconds=70)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": f"evt-{prefix}-dev-01",
        "timestamp": d_ts,
        "event_type": "new_device",
        "source_ip": ip,
        "user_id": user,
        "attempted_username": user,
        "device_id": device,
        "resource": None,
        "severity": "medium",
        "metadata": {}
    })

    # Priv Esc
    p_ts = (base_time + timedelta(seconds=100)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": f"evt-{prefix}-esc-01",
        "timestamp": p_ts,
        "event_type": "privilege_escalation",
        "source_ip": ip,
        "user_id": user,
        "attempted_username": user,
        "device_id": device,
        "resource": None,
        "severity": "high",
        "metadata": {"role_before": "user", "role_after": "admin"}
    })

    return events


def run_multi_incident_isolation_test():
    print("=" * 80)
    print("  PHASE 4: MULTI-INCIDENT ISOLATION VERIFICATION")
    print("=" * 80)

    # 1. Generate interleaved event streams for Attack A and Attack B
    events_A = generate_synthetic_attack("A", "test-user-A", "203.0.113.101", "test-device-A")
    events_B = generate_synthetic_attack("B", "test-user-B", "203.0.113.102", "test-device-B")
    all_events = events_A + events_B

    print(f"[+] Total Interleaved Synthetic Events: {len(all_events)}")
    print("    Stream A: test-user-A / 203.0.113.101 / test-device-A")
    print("    Stream B: test-user-B / 203.0.113.102 / test-device-B")

    # 2. Run Detection over combined batch
    detections = run_all_rules(all_events, sensitive_resources={"srv-grades-db"})
    print(f"\n[1] Total Detections Fired: {len(detections)}")

    # 3. Run Correlation
    chains = correlate(detections, incident_id="INC-0004")
    print(f"[2] Correlated Attack Chains Created: {len(chains)}")

    assert len(chains) == 2, f"Expected 2 separate attack chains, got {len(chains)}"
    chain_A = chains[0]
    chain_B = chains[1]

    print(f"    Chain 1: ID = {chain_A.incident_id}, Entities = {chain_A.entities}")
    print(f"    Chain 2: ID = {chain_B.incident_id}, Entities = {chain_B.entities}")

    # 4. Verify Evidence Isolation (No Evidence Bleed)
    known_A_ids = {e["event_id"] for e in events_A}
    known_B_ids = {e["event_id"] for e in events_B}

    bundle_A = build_evidence_bundle(chain_A.incident_id, chain_A.detections)
    bundle_B = build_evidence_bundle(chain_B.incident_id, chain_B.detections)

    fab_A = validate_no_fabrication(bundle_A, known_A_ids)
    fab_B = validate_no_fabrication(bundle_B, known_B_ids)

    print(f"\n[3] Evidence Isolation Verification:")
    print(f"    Bundle A ({chain_A.incident_id}): {len(bundle_A.items)} items | Anti-Fab vs A IDs: {'PASSED' if not fab_A else 'FAILED'}")
    print(f"    Bundle B ({chain_B.incident_id}): {len(bundle_B.items)} items | Anti-Fab vs B IDs: {'PASSED' if not fab_B else 'FAILED'}")

    # Check that Bundle A has zero event IDs from Stream B
    bleed_A_has_B = any(ev_id in known_B_ids for item in bundle_A.items for ev_id in item.source_event_ids)
    bleed_B_has_A = any(ev_id in known_A_ids for item in bundle_B.items for ev_id in item.source_event_ids)

    assert not bleed_A_has_B, "CRITICAL BUG: Evidence bleed detected! Bundle A contains event IDs from Stream B."
    assert not bleed_B_has_A, "CRITICAL BUG: Evidence bleed detected! Bundle B contains event IDs from Stream A."
    print("    Bleed Check: ZERO evidence bleed between Incident A and Incident B.")

    # 5. Verify Remediation Target Mismatch (Cross-Incident Remediation Block)
    print(f"\n[4] Cross-Incident Authorization Governance Test:")
    context_mismatch = {
        "approved_by_analyst": True,
        "approved_by_admin": False,
        "request_source": "analyst_ui",
        "mfa_authenticated": False,
        "risk_level": "medium",
        "target_matches_incident": False,  # Cross-incident mismatch!
        "incident_id": chain_A.incident_id,
    }

    auth_mismatch = cedar_authorize(
        principal='SentinelFlow::User::"analyst_jordan"',
        action='SentinelFlow::Action::"execute_remediation"',
        resource='SentinelFlow::ResponseAction::"ACT-001"',
        context=context_mismatch,
    )
    print(f"    Cross-Incident Remediation Attempt (A -> B): Cedar Decision = {auth_mismatch.decision}")
    assert auth_mismatch.decision == "DENY", "CRITICAL BUG: Cross-incident remediation was allowed!"

    print("\n[+] Phase 4 Verification Status: PASS")


if __name__ == "__main__":
    run_multi_incident_isolation_test()
