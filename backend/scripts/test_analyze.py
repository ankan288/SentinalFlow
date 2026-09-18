import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'api'))
from unittest.mock import MagicMock
sys.modules['boto3'] = MagicMock()
sys.modules['opensearchpy'] = MagicMock()
sys.modules['requests_aws4auth'] = MagicMock()
import os
os.environ['LOCAL_TEST_MODE'] = '1'
import analyze_handler

print('--- Testing AI Agent Integration (Phase 6) ---')

event = {
    'pathParameters': {'id': 'INC-001'},
    'requestContext': {'authorizer': {'claims': {'cognito:groups': '[ANALYST]'}}}
}

print("\n[POST /incidents/INC-001/analyze]")
response = analyze_handler.lambda_handler(event, None)
print(f"Status Code: {response['statusCode']}")
assert response['statusCode'] in (200, 201), f"Unexpected status code: {response['statusCode']}"
print(f"Body: {json.dumps(json.loads(response['body']), indent=2)}")
