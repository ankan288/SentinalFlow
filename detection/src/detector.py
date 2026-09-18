"""
detector.py — deterministic, LLM-free detection engine (TB-3).

Design constraint (see docs/security/threat-model.md, section 4):
This module must NEVER call an LLM and must NEVER let free-text fields
(attempted_username, resource, metadata.*) influence control flow beyond
simple equality/membership checks. It only reasons over timestamps,
counts, and IDs. Free text is carried through into `evidence` as
inert display data for a human/LLM to read later — never executed,
templated into a prompt, or evaluated here.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
import itertools

_incident_seq = itertools.count(1)


def _parse_ts(ts: str) -> datetime:
    # Events use ISO-8601 with a trailing 'Z'; normalize for stdlib parsing.
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


@dataclass
class Detection:
    rule_id: str
    detection_type: str
    severity: str
    involved_entities: dict
    evidence: list[str]
    related_event_ids: list[str]
    incident_candidate_id: str = field(default_factory=lambda: f"INC-{next(_incident_seq):04d}")


def _group_by(events: list[dict], key: str) -> dict[str, list[dict]]:
    groups: dict[str, list[dict]] = {}
    for e in events:
        k = e.get(key)
        if k is None:
            continue
        groups.setdefault(k, []).append(e)
    return groups


def detect_brute_force(
    events: list[dict],
    window_seconds: int = 300,
    threshold_count: int = 5,
) -> list[Detection]:
    """RULE-001: clusters login_failed events for the same source_ip where
    consecutive events are no more than window_seconds apart, and emits ONE
    detection per cluster that reaches threshold_count. Clustering (rather
    than a naive sliding-count) avoids emitting a separate detection every
    time the count crosses the threshold within one continuous burst."""
    failed = [e for e in events if e.get("event_type") == "login_failed"]
    failed.sort(key=lambda e: _parse_ts(e["timestamp"]))

    detections = []
    by_ip = _group_by(failed, "source_ip")
    for ip, ip_events in by_ip.items():
        cluster: list[dict] = []
        prev_t: Optional[datetime] = None
        for e in ip_events:
            t = _parse_ts(e["timestamp"])
            if prev_t is not None and (t - prev_t) > timedelta(seconds=window_seconds):
                if len(cluster) >= threshold_count:
                    detections.append(_brute_force_detection(ip, cluster))
                cluster = []
            cluster.append(e)
            prev_t = t
        if len(cluster) >= threshold_count:
            detections.append(_brute_force_detection(ip, cluster))
    return detections


def _brute_force_detection(ip: str, cluster: list[dict]) -> Detection:
    first_t = _parse_ts(cluster[0]["timestamp"])
    last_t = _parse_ts(cluster[-1]["timestamp"])
    return Detection(
        rule_id="RULE-001",
        detection_type="brute_force_attempt",
        severity="medium",
        involved_entities={"source_ip": ip},
        evidence=[
            f"{len(cluster)} failed authentication attempts from {ip} "
            f"between {first_t.isoformat()} and {last_t.isoformat()}"
        ],
        related_event_ids=[w["event_id"] for w in cluster],
    )


def detect_credential_compromise(
    events: list[dict],
    brute_force_hits: list[Detection],
    follow_up_window_seconds: int = 600,
) -> list[Detection]:
    """RULE-002: a RULE-001 hit followed by a login_success for the same
    source_ip within follow_up_window_seconds of the last failed attempt."""
    successes = [e for e in events if e.get("event_type") == "login_success"]
    detections = []

    for hit in brute_force_hits:
        ip = hit.involved_entities["source_ip"]
        related = [e for e in events if e["event_id"] in hit.related_event_ids]
        last_fail_t = max(_parse_ts(e["timestamp"]) for e in related)

        for s in successes:
            if s.get("source_ip") != ip:
                continue
            s_t = _parse_ts(s["timestamp"])
            if s_t < last_fail_t:
                continue
            if s_t - last_fail_t <= timedelta(seconds=follow_up_window_seconds):
                gap = int((s_t - last_fail_t).total_seconds())
                detections.append(Detection(
                    rule_id="RULE-002",
                    detection_type="credential_compromise_suspected",
                    severity="high",
                    involved_entities={"source_ip": ip, "user_id": s.get("user_id")},
                    evidence=hit.evidence + [
                        f"Successful login for user {s.get('user_id')} from the same source "
                        f"at {s_t.isoformat()}, {gap}s after the last failure"
                    ],
                    related_event_ids=hit.related_event_ids + [s["event_id"]],
                ))
    return detections


def detect_privilege_escalation_after_new_device(
    events: list[dict],
    window_seconds: int = 900,
) -> list[Detection]:
    """RULE-003: a new_device event followed by a privilege_escalation
    for the same user_id within window_seconds."""
    new_devices = [e for e in events if e.get("event_type") == "new_device"]
    escalations = [e for e in events if e.get("event_type") == "privilege_escalation"]
    detections = []

    for nd in new_devices:
        user = nd.get("user_id")
        nd_t = _parse_ts(nd["timestamp"])
        for esc in escalations:
            if esc.get("user_id") != user:
                continue
            esc_t = _parse_ts(esc["timestamp"])
            if esc_t < nd_t:
                continue
            if esc_t - nd_t <= timedelta(seconds=window_seconds):
                gap = int((esc_t - nd_t).total_seconds())
                meta = esc.get("metadata", {})
                detections.append(Detection(
                    rule_id="RULE-003",
                    detection_type="privilege_escalation_after_new_device",
                    severity="high",
                    involved_entities={"user_id": user, "device_id": nd.get("device_id")},
                    evidence=[
                        f"Login from previously unseen device {nd.get('device_id')} "
                        f"for user {user} at {nd_t.isoformat()}",
                        f"Privilege escalation ({meta.get('role_before')} -> {meta.get('role_after')}) "
                        f"for user {user} at {esc_t.isoformat()}, {gap}s later",
                    ],
                    related_event_ids=[nd["event_id"], esc["event_id"]],
                ))
    return detections


def detect_unusual_sensitive_access(
    events: list[dict],
    sensitive_resources: set[str],
    access_history: Optional[dict[str, set[str]]] = None,
) -> list[Detection]:
    """RULE-004: a user_id accesses a resource in sensitive_resources with
    no record of prior access in access_history (user_id -> set of resources
    previously accessed). access_history defaults to "no history for anyone",
    which is correct for a fresh demo dataset."""
    access_history = access_history or {}
    accesses = [
        e for e in events
        if e.get("event_type") == "resource_access" and e.get("resource") in sensitive_resources
    ]
    detections = []
    for e in accesses:
        user = e.get("user_id")
        prior = access_history.get(user, set())
        if e.get("resource") not in prior:
            t = _parse_ts(e["timestamp"])
            detections.append(Detection(
                rule_id="RULE-004",
                detection_type="unusual_sensitive_access",
                severity="high",
                involved_entities={"user_id": user, "resource": e.get("resource")},
                evidence=[
                    f"User {user} accessed sensitive resource {e.get('resource')} at {t.isoformat()}",
                    "No prior access to this resource found for this user",
                ],
                related_event_ids=[e["event_id"]],
            ))
    return detections


def run_all_rules(
    events: list[dict],
    sensitive_resources: set[str] = frozenset({"srv-grades-db"}),
    access_history: Optional[dict[str, set[str]]] = None,
) -> list[Detection]:
    """Convenience entry point: run every rule over one batch of events.
    NOTE: for a real deployment this batch would come from a sliding
    window over OpenSearch, not an in-memory list — Member 2/backend
    owns that plumbing (see contracts/events/security-event.schema.json)."""
    brute_force = detect_brute_force(events)
    compromise = detect_credential_compromise(events, brute_force)
    privesc = detect_privilege_escalation_after_new_device(events)
    sensitive = detect_unusual_sensitive_access(events, sensitive_resources, access_history)
    return brute_force + compromise + privesc + sensitive
