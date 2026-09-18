import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'workflow'))
from unittest.mock import MagicMock
sys.modules['boto3'] = MagicMock()
import audit_handler

print("--- Testing Immutable Audit Log Generation (Phase 10) ---")

state = {
    "IncidentId": "INC-001",
    "Action": "BLOCK_IP_10.0.0.50",
    "Executor": "Analyst: alice@sentinelflow.local"
}

print(f"\n[Executing Audit Handler for Incident: {state['IncidentId']}]")
result = audit_handler.lambda_handler(state, None)

print(f"\nResult: {json.dumps(result, indent=2)}")
