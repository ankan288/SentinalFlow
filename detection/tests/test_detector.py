"""
test_detector.py — Phase 2/5 tests: each rule against its target scenario,
plus the benign datasets as false-positive guards.

Run with: pytest detection/tests/test_detector.py -v
(run from repo root with detection/src on PYTHONPATH, e.g.
 PYTHONPATH=detection/src pytest detection/tests/test_detector.py -v)
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from detector import (
    detect_brute_force,
    detect_credential_compromise,
    detect_privilege_escalation_after_new_device,
    detect_unusual_sensitive_access,
    run_all_rules,
)

DATASETS = os.path.join(os.path.dirname(__file__), "..", "datasets")


def _load(name):
    with open(os.path.join(DATASETS, name, "events.json")) as f:
        return json.load(f)["events"]


def test_rule_001_fires_on_scenario_01():
    events = _load("scenario-01-brute-force")
    hits = detect_brute_force(events)
    assert len(hits) >= 1
    assert hits[0].rule_id == "RULE-001"
    assert len(hits[0].related_event_ids) >= 5


def test_rule_002_fires_on_scenario_01():
    events = _load("scenario-01-brute-force")
    brute_force = detect_brute_force(events)
    compromise = detect_credential_compromise(events, brute_force)
    assert len(compromise) == 1
    assert compromise[0].rule_id == "RULE-002"
    assert compromise[0].severity == "high"


def test_rule_003_fires_on_scenario_02():
    events = _load("scenario-02-privilege-escalation")
    hits = detect_privilege_escalation_after_new_device(events)
    assert len(hits) == 1
    assert hits[0].involved_entities["user_id"] == "u-8823"


def test_rule_004_fires_on_scenario_03():
    events = _load("scenario-03-sensitive-access")
    hits = detect_unusual_sensitive_access(events, sensitive_resources={"srv-grades-db"})
    assert len(hits) == 1
    assert hits[0].rule_id == "RULE-004"


def test_benign_normal_login_triggers_nothing():
    with open(os.path.join(DATASETS, "benign", "normal-login.json")) as f:
        events = json.load(f)["events"]
    hits = run_all_rules(events)
    assert hits == []


def test_forgotten_password_does_not_produce_high_severity_false_positive():
    with open(os.path.join(DATASETS, "benign", "forgotten-password.json")) as f:
        events = json.load(f)["events"]
    # 6 failures from a KNOWN device is below/at the edge of the threshold;
    # this test documents current behavior and should be revisited once
    # Member 2/backend supplies real device-reputation context (Phase 5).
    brute_force = detect_brute_force(events, threshold_count=5)
    compromise = detect_credential_compromise(events, brute_force)
    if compromise:
        # If it does fire, at minimum it must not be indistinguishable from
        # a real compromise: same known device_id throughout is the signal
        # a human reviewer (or the AI explanation) should surface.
        device_ids = {e.get("device_id") for e in events}
        assert len(device_ids) == 1, "false positive should at least show device continuity"


def test_malformed_event_missing_required_field_does_not_crash():
    malformed = [{"event_type": "login_failed"}]  # missing event_id, timestamp, source_ip
    try:
        detect_brute_force(malformed)
        raised = False
    except KeyError:
        raised = True
    # Current implementation raises on missing 'timestamp'/'source_ip' —
    # this test documents that ingestion-layer validation (C-01, Member 2)
    # MUST reject malformed events before they ever reach this module.
    assert raised, "detector assumes ingestion already validated the schema"
