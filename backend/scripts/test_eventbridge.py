import sys
import os
import json
import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'events'))
import security_event_handler

print('--- Testing EventBridge to Lambda Flow (Phase 7) ---')

eb_event = {
    "version": "0",
    "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
    "detail-type": "SecurityEvent",
    "source": "com.sentinelflow.security",
    "account": "111122223333",
    "time": datetime.datetime.now().isoformat() + "Z",
    "region": "us-east-1",
    "detail": {
        "event_id": "EVT-999",
        "event_type": "MultipleFailedLogins",
        "source_ip": "10.0.0.50",
        "username": "admin",
        "attempts": 27
    }
}

print(f"\n[Simulating EventBridge Event Trigger]")
print(f"Source: {eb_event['source']}")
print(f"Detail Type: {eb_event['detail-type']}")
print(f"Payload: {json.dumps(eb_event['detail'], indent=2)}")

print("\n[Executing Lambda Handler]")
security_event_handler.lambda_handler(eb_event, None)
