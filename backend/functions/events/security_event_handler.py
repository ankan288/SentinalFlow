import json
import os
import boto3
import uuid
import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table_name = os.environ.get('INCIDENTS_TABLE_NAME', 'SentinelFlow-Incidents')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    """
    Triggered asynchronously by EventBridge when a new security event occurs.
    """
    print(f"Received EventBridge event: {json.dumps(event)}")
    
    # EventBridge places the payload inside the 'detail' object
    detail = event.get('detail', {})
    event_type = detail.get('event_type')
    source_ip = detail.get('source_ip')
    
    if not event_type or not source_ip:
        print("Invalid event payload. Skipping.")
        return
        
    print(f"Processing event {event_type} from {source_ip}")
    
    severity = "HIGH" if event_type.lower() == "brute_force" else "MEDIUM"
    incident_id = f"INC-{str(uuid.uuid4())[:8]}"
    
    incident = {
        "IncidentId": incident_id,
        "Status": "NEW",
        "Severity": severity,
        "Description": f"Detected {event_type} from {source_ip}",
        "CreatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "ContextData": json.dumps(detail)
    }
    
    try:
        table.put_item(Item=incident)
        print(f"Created incident {incident_id} successfully.")
    except Exception as e:
        print(f"Failed to create incident: {e}")
        raise
