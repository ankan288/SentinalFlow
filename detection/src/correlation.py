"""
correlation.py — Phase 3: turns independent rule Detections into a single
attack chain when they share entities (source_ip, user_id, device_id).

Output shape matches contracts/incidents/attack-sequence.schema.json
(ATTACKER/IP -> ACCOUNT -> DEVICE -> PRIVILEGE -> RESOURCE), which is the
machine-readable representation handed to the AI agent (Member 1) and
rendered by the frontend (Member 3, AttackGraphCanvas.tsx).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from detector import Detection


@dataclass
class AttackChain:
    incident_id: str
    entities: dict           # {"source_ip": ..., "user_id": ..., "device_id": ..., "resource": ...}
    detections: list[Detection] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "incident_id": self.incident_id,
            "entities": self.entities,
            "stages": [
                {
                    "rule_id": d.rule_id,
                    "detection_type": d.detection_type,
                    "severity": d.severity,
                    "related_event_ids": d.related_event_ids,
                }
                for d in sorted(self.detections, key=lambda d: d.related_event_ids[0] if d.related_event_ids else "")
            ],
        }


def _entities_overlap(a: dict, b: dict) -> bool:
    for key in ("source_ip", "user_id", "device_id"):
        if a.get(key) and b.get(key) and a[key] == b[key]:
            return True
    return False


def correlate(detections: list[Detection], incident_id: str = "INC-0001") -> list[AttackChain]:
    """Greedy union-find style grouping: detections sharing a source_ip,
    user_id, or device_id are folded into the same AttackChain. This keeps
    Phase 3 deliberately simple (JSON-based, no graph DB) per the plan's
    'don't overcomplicate it' instruction."""
    chains: list[AttackChain] = []

    for d in detections:
        placed = False
        for chain in chains:
            if _entities_overlap(chain.entities, d.involved_entities):
                chain.entities.update({k: v for k, v in d.involved_entities.items() if v})
                chain.detections.append(d)
                placed = True
                break
        if not placed:
            chains.append(AttackChain(
                incident_id=f"{incident_id}-{len(chains)+1}",
                entities=dict(d.involved_entities),
                detections=[d],
            ))
    return chains
