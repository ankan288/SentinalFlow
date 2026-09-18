"""
evidence.py — Phase 4: the evidence engine.

Contract (C-04): every claim the AI agent or frontend ever displays about
an incident MUST trace back to an evidence ID here, which in turn traces
back to one or more real event_ids in the source data. There is no path
by which "evidence" is synthesized from nothing — build_evidence_bundle()
only ever wraps facts that a Detection already computed from real events.
"""

from __future__ import annotations
from dataclasses import dataclass
from detector import Detection


@dataclass
class EvidenceItem:
    evidence_id: str
    statement: str
    source_event_ids: list[str]


@dataclass
class EvidenceBundle:
    incident_id: str
    rules_fired: list[str]
    items: list[EvidenceItem]

    def to_dict(self) -> dict:
        return {
            "incident_id": self.incident_id,
            "rules_fired": self.rules_fired,
            "evidence": [
                {"id": i.evidence_id, "statement": i.statement, "source_event_ids": i.source_event_ids}
                for i in self.items
            ],
        }


def build_evidence_bundle(incident_id: str, detections: list[Detection]) -> EvidenceBundle:
    """Merge one or more rule Detections (already correlated to the same
    incident by correlation.py) into a single evidence bundle with stable,
    referenceable evidence IDs (E1, E2, ...)."""
    items: list[EvidenceItem] = []
    rules_fired: list[str] = []
    counter = 1
    for d in detections:
        rules_fired.append(d.rule_id)
        for statement in d.evidence:
            items.append(EvidenceItem(
                evidence_id=f"E{counter}",
                statement=statement,
                source_event_ids=d.related_event_ids,
            ))
            counter += 1
    return EvidenceBundle(incident_id=incident_id, rules_fired=rules_fired, items=items)


def validate_no_fabrication(bundle: EvidenceBundle, known_event_ids: set[str]) -> list[str]:
    """Defensive check (feeds Phase 6/9 tests): every source_event_id an
    evidence item claims must exist in the known event set. Returns a list
    of problems (empty = clean). This is what stands between us and the
    failure mode 'the AI/agent claims evidence that doesn't exist' (T-07)."""
    problems = []
    for item in bundle.items:
        for eid in item.source_event_ids:
            if eid not in known_event_ids:
                problems.append(f"{item.evidence_id} references unknown event_id {eid}")
    return problems
