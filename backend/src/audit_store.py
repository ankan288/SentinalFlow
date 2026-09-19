"""
audit_store.py — Append-only audit store for SentinelFlow (C-09).

Logs every authorization decision, principal, action, resource, and timestamp.
Enforces audit log immutability by prohibiting record deletion.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

logger = logging.getLogger("sentinelflow.audit_store")


class AppendOnlyAuditStore:
    """In-memory append-only audit trail store."""

    def __init__(self) -> None:
        self._records: list[dict[str, Any]] = []
        self._counter: int = 0

    def record_decision(
        self,
        principal: str,
        action: str,
        resource: str,
        decision: str,
        incident_id: str = "INC-0001-1",
        context: Optional[dict[str, Any]] = None,
        reasons: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """Record an authorization decision in the audit log."""
        self._counter += 1
        audit_id = f"aud-{self._counter:06d}"
        timestamp = datetime.now(timezone.utc).isoformat()

        record = {
            "audit_id": audit_id,
            "timestamp": timestamp,
            "principal": principal,
            "action": action,
            "resource": resource,
            "decision": decision,
            "incident_id": incident_id,
            "context": context or {},
            "reasons": reasons or [],
        }

        self._records.append(record)
        logger.info("Audit record created: %s -> %s for %s", audit_id, decision, principal)
        return record

    def get_records(self, incident_id: Optional[str] = None) -> list[dict[str, Any]]:
        """Retrieve audit records, optionally filtered by incident_id."""
        if incident_id:
            return [r for r in self._records if r.get("incident_id") == incident_id]
        return list(self._records)

    def delete_records(self, incident_id: Optional[str] = None) -> None:
        """
        Attempting to delete audit records raises PermissionError.
        Implements C-09 immutability requirement.
        """
        raise PermissionError("Audit logs are append-only and immutable. Deletion is strictly forbidden.")


# Singleton instance for default pipeline consumption
default_audit_store = AppendOnlyAuditStore()
