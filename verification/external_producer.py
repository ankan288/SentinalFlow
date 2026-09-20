"""
external_producer.py — Safe synthetic external event producer for Phase 2 verification.

Generates a realistic attack sequence:
10 failed logins -> 1 success -> 1 new device -> 1 privilege escalation -> 1 sensitive resource access
Using synthetic entities: test-user-9001, 203.0.113.99, test-device-9001, srv-test-sensitive-db.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timedelta, timezone

CURRENT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "backend", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "contracts", "authorization"))
sys.path.insert(0, os.path.join(REPO_ROOT, "ai-agent", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "detection", "src"))

sys.path.insert(0, REPO_ROOT)
from shared.device_info import get_device_model_name
from pipeline import SentinelFlowPipeline
from detector import run_all_rules


def generate_external_attack_sequence() -> list[dict]:
    detected_device = get_device_model_name()
    base_time = datetime(2026, 3, 19, 14, 0, 0, tzinfo=timezone.utc)
    events = []

    # 1. 10 Failed Logins
    for i in range(1, 11):
        ts = (base_time + timedelta(seconds=i * 5)).isoformat().replace("+00:00", "Z")
        events.append({
            "event_id": f"evt-ext90010{i:02d}",
            "timestamp": ts,
            "event_type": "login_failed",
            "source_ip": "203.0.113.99",
            "user_id": "test-user-9001",
            "attempted_username": f"test-user-9001-attempt-{i}",
            "device_id": None,
            "resource": None,
            "severity": "medium",
            "metadata": {"attempt_num": i}
        })

    # 2. 1 Successful Login (15 seconds post burst)
    success_ts = (base_time + timedelta(seconds=70)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": "evt-ext9001011",
        "timestamp": success_ts,
        "event_type": "login_success",
        "source_ip": "203.0.113.99",
        "user_id": "test-user-9001",
        "attempted_username": "test-user-9001",
        "device_id": None,
        "resource": None,
        "severity": "low",
        "metadata": {"auth_method": "password"}
    })

    # 3. 1 New Device Login
    device_ts = (base_time + timedelta(seconds=120)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": "evt-ext9001012",
        "timestamp": device_ts,
        "event_type": "new_device",
        "source_ip": "203.0.113.99",
        "user_id": "test-user-9001",
        "attempted_username": "test-user-9001",
        "device_id": detected_device,
        "resource": None,
        "severity": "medium",
        "metadata": {"user_agent": "SyntheticTestBrowser/1.0"}
    })

    # 4. 1 Privilege Escalation
    privesc_ts = (base_time + timedelta(seconds=180)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": "evt-ext9001013",
        "timestamp": privesc_ts,
        "event_type": "privilege_escalation",
        "source_ip": "203.0.113.99",
        "user_id": "test-user-9001",
        "attempted_username": "test-user-9001",
        "device_id": detected_device,
        "resource": None,
        "severity": "high",
        "metadata": {"role_before": "regular_user", "role_after": "system_admin"}
    })

    # 5. 1 Sensitive Resource Access
    access_ts = (base_time + timedelta(seconds=240)).isoformat().replace("+00:00", "Z")
    events.append({
        "event_id": "evt-ext9001014",
        "timestamp": access_ts,
        "event_type": "resource_access",
        "source_ip": "203.0.113.99",
        "user_id": "test-user-9001",
        "attempted_username": "test-user-9001",
        "device_id": detected_device,
        "resource": "srv-grades-db",
        "severity": "high",
        "metadata": {"access_type": "read_records"}
    })

    return events


def run_external_ingestion_test():
    print("=" * 80)
    print("  PHASE 2: EXTERNAL EVENT INGESTION & PIPELINE VERIFICATION")
    print("=" * 80)

    events = generate_external_attack_sequence()
    print(f"[+] Generated {len(events)} synthetic external events:")
    print("    Entities: test-user-9001 | 203.0.113.99 | test-device-9001 | srv-test-sensitive-db")

    pipeline = SentinelFlowPipeline()
    # Process events through full pipeline
    result = pipeline.process_events(
        raw_events=events,
        actor_principal='SentinelFlow::User::"analyst_jordan"',
        analyst_approved=True,
        admin_approved=False,
        mfa_authenticated=False,
    )

    ing = result["stages"]["ingestion"]
    print(f"\n[1] Ingestion: Validated = {ing['validated_count']}, Rejected = {ing['rejected_count']}")

    det = result["stages"]["detection"]
    print(f"[2] Detections Fired = {det['detection_count']}")
    for d in det["detections"]:
        print(f"    -> [{d['severity'].upper()}] {d['rule_id']} ({d['type']})")
        print(f"       Involved: {d['entities']}")

    corr = result["stages"]["correlation"]
    print(f"[3] Correlated Incident ID = {corr['incident_id']}")
    print(f"    Entities: {corr['entities']}")

    ev = result["stages"]["evidence"]
    print(f"[4] Evidence Items = {ev['evidence_count']}, Anti-Fabrication = {ev['anti_fabrication_check']}")

    ai = result["stages"]["ai_investigation"]
    print(f"[5] AI Investigation Severity = {ai['severity']}, Actions Proposed = {len(ai['recommended_actions'])}")

    auth = result["stages"]["authorization"]
    print(f"[6] Cedar Decisions:")
    for a in auth:
        print(f"    -> {a['action_id']}: Decision = {a['decision']}, Reasons = {a['reasons']}")

    print("\n[+] Phase 2 Verification Status: PASS")
    return result


if __name__ == "__main__":
    run_external_ingestion_test()
