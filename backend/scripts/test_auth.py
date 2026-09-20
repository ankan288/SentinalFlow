import sys
import os
import json
from unittest.mock import MagicMock

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'api'))
import incidents_handler

print('--- Testing RBAC Decorator ---')

incidents_handler.table = MagicMock()
incidents_handler.table.scan.return_value = {'Items': []}

# Test 1: No Claims (Unauthorized)
event_no_auth = {}
res1 = incidents_handler.lambda_handler(event_no_auth, None)
print(f"Test 1 (No Auth): {res1['statusCode']} - {json.loads(res1['body'])['message']}")

# Test 2: Analyst Role (Authorized)
event_analyst = {'requestContext': {'authorizer': {'claims': {'cognito:groups': '[ANALYST]'}}}}
res2 = incidents_handler.lambda_handler(event_analyst, None)
print(f"Test 2 (Analyst): {res2['statusCode']}")

# Test 3: Unknown Role (Unauthorized)
event_unknown = {'requestContext': {'authorizer': {'claims': {'cognito:groups': '[RANDOM_GUY]'}}}}
res3 = incidents_handler.lambda_handler(event_unknown, None)
print(f"Test 3 (Unknown): {res3['statusCode']} - {json.loads(res3['body'])['message']}")
