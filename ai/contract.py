"""
SentinelFlow Backend Integration Contract Module.

This module provides a clean Python API for backend teammates to invoke
the SentinelFlow AI security intelligence engine.

Usage:
    from ai.contract import analyze_incident_api

    response = analyze_incident_api({"incident_id": "INC-BF-001"})
"""

from typing import Any
try:
    from .analyzer import analyze_incident
except ImportError:
    from analyzer import analyze_incident


def analyze_incident_api(request: dict[str, Any]) -> dict[str, Any]:
    """
    Backend contract endpoint for incident analysis.

    Args:
        request: Dictionary containing "incident_id", e.g. {"incident_id": "INC-BF-001"}

    Returns:
        Structured Attack Story dictionary adhering to attack_story.json schema.

    Raises:
        ValueError: If incident_id is missing or incident is not found.
    """
    if not isinstance(request, dict) or "incident_id" not in request:
        raise ValueError("Invalid request payload. Must contain 'incident_id'.")

    incident_id = str(request["incident_id"]).strip()
    return analyze_incident(incident_id)
