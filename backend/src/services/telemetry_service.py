"""
telemetry_service.py — Server-side real telemetry extraction & ingestion pipeline.

Processes live user login/auth telemetry events completely separate from the demo dataset.
Extracts client IP server-side, parses User-Agent headers, maps Cognito claims,
and passes events into the live detection pipeline.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timezone

CURRENT_DIR = os.path.dirname(__file__)
SRC_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from utils.user_agent_parser import parse_user_agent
from pipeline import SentinelFlowPipeline


def extract_source_ip(event: dict) -> str:
    """
    Extracts server-observed client IP address.
    Precedence:
    1. event.requestContext.identity.sourceIp (API Gateway server-observed)
    2. X-Forwarded-For header (first IP)
    3. Fallback: 127.0.0.1 (Localhost)
    """
    request_ctx = event.get("requestContext") or {}
    identity = request_ctx.get("identity") or {}
    server_ip = identity.get("sourceIp")
    if server_ip and server_ip.strip():
        return server_ip.strip()

    headers = event.get("headers") or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    forwarded = headers_lower.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
        if client_ip:
            return client_ip

    return "127.0.0.1"


def extract_user_email(event: dict, payload_user: str | None = None) -> str:
    """
    Extracts authenticated user email/identity from Cognito claims or request body.
    """
    request_ctx = event.get("requestContext") or {}
    authorizer = request_ctx.get("authorizer") or {}
    claims = authorizer.get("claims") or {}
    
    email = claims.get("email") or claims.get("username") or claims.get("sub")
    if email and isinstance(email, str) and email.strip():
        return email.strip()

    if payload_user and isinstance(payload_user, str) and payload_user.strip():
        return payload_user.strip()

    return "anonymous@sentinelflow.io"


def extract_device_info(event: dict) -> tuple[str, str]:
    """
    Extracts User-Agent header and parses into (device_id_slug, user_agent_summary).
    """
    headers = event.get("headers") or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    ua_str = headers_lower.get("user-agent", "")

    parsed = parse_user_agent(ua_str)
    return parsed["device_slug"], parsed["summary"]


def ingest_real_telemetry_event(api_gateway_event: dict, payload: dict) -> dict:
    """
    Processes a real incoming telemetry event:
    1. Server-side IP extraction
    2. Server-side Cognito email mapping
    3. Server-side User-Agent parsing
    4. Execution through real SentinelFlow ingestion/detection pipeline
    """
    source_ip = extract_source_ip(api_gateway_event)
    user_email = extract_user_email(api_gateway_event, payload.get("user_id") or payload.get("email"))
    device_id, device_summary = extract_device_info(api_gateway_event)

    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    event_type = payload.get("event_type", "login_success")

    # Build schema-compliant event
    schema_event = {
        "event_id": f"evt-{uuid.uuid4().hex[:12]}",
        "timestamp": payload.get("timestamp", now_utc),
        "ingested_at": now_utc,
        "event_type": event_type,
        "user_id": user_email,
        "attempted_username": payload.get("attempted_username") or user_email,
        "source_ip": source_ip,
        "device_id": device_id,
        "resource": payload.get("resource", "auth-service"),
        "severity": payload.get("severity", "info" if event_type == "login_success" else "medium"),
        "metadata": {
            "user_agent_summary": device_summary,
            "raw_user_agent": (api_gateway_event.get("headers") or {}).get("User-Agent", "Unknown"),
            "environment": payload.get("environment", "live-app")
        }
    }

    # Process event through real pipeline
    pipeline = SentinelFlowPipeline()
    result = pipeline.process_events(
        raw_events=[schema_event],
        actor_principal=f'SentinelFlow::User::"{user_email}"',
        analyst_approved=False,
        admin_approved=False,
        mfa_authenticated=False
    )

    return {
        "status": "success",
        "processed_event": schema_event,
        "pipeline_result": result
    }
