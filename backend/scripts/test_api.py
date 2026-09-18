import sys
import os
import json
from unittest.mock import MagicMock

# Add functions dir to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'api'))

from unittest.mock import MagicMock
sys.modules['boto3'] = MagicMock()
import incidents_handler
import incident_detail_handler

print("--- Testing API Handlers Locally (Mocked DB) ---")

# Mock the DynamoDB table scan response
incidents_handler.table = MagicMock()
incidents_handler.table.scan.return_value = {
    'Items': [{'IncidentId': 'INC-001', 'Status': 'OPEN'}]
}

# Test GET /incidents
print("\n[GET /incidents]")
event = {}
response = incidents_handler.lambda_handler(event, None)
print(f"Status Code: {response['statusCode']}")
print(f"Body: {json.dumps(json.loads(response['body']), indent=2)}")

# Mock the DynamoDB table get_item response
incident_detail_handler.table = MagicMock()
incident_detail_handler.table.get_item.return_value = {
    'Item': {
        'IncidentId': 'INC-001', 
        'Status': 'OPEN', 
        'Description': 'Detected brute force attack on admin account',
        'Severity': 'HIGH'
    }
}

# Test GET /incidents/{id}
print("\n[GET /incidents/INC-001]")
event = {'pathParameters': {'id': 'INC-001'}}
response = incident_detail_handler.lambda_handler(event, None)
print(f"Status Code: {response['statusCode']}")
print(f"Body: {json.dumps(json.loads(response['body']), indent=2)}")
