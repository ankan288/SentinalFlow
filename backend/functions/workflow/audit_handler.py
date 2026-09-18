import json
import datetime
import uuid
import os
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client('s3', region_name='us-east-1')
bucket_name = os.environ.get('AUDIT_BUCKET')

def generate_audit_event(incident_id, action, executor):
    """
    Generates the standard schema for an audit event.
    """
    return {
        "AuditId": str(uuid.uuid4()),
        "Timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "IncidentId": incident_id,
        "ActionTaken": action,
        "Executor": executor,
        "AuthorizationSource": "Amazon Cedar",
        "ApprovalSource": "Human Workflow"
    }

def lambda_handler(event, context):
    """
    Step Functions WriteAuditLog state.
    Writes the immutable record to the WORM S3 Bucket.
    """
    incident_id = event.get('IncidentId', 'UNKNOWN')
    action = event.get('Action', 'UNKNOWN')
    
    # In reality, executor comes from the TaskToken context or initial input
    executor = event.get('Executor') or event.get('ApprovalResult', {}).get('Payload', {}).get('Executor') or event.get('ApprovalResult', {}).get('Executor')
    if not executor:
        print("Error: Executor missing from workflow event.")
        return {
            "status": "ERROR",
            "message": "Executor identity missing. Cannot attribute audit log."
        }
        
    if not bucket_name:
        raise ValueError("AUDIT_BUCKET environment variable is not set")
    
    audit_record = generate_audit_event(incident_id, action, executor)
    
    print(f"[{audit_record['Timestamp']}] Writing Audit Log to WORM S3 Bucket...")
    print(json.dumps(audit_record, indent=2))
    
    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=f"audit/{audit_record['AuditId']}.json",
            Body=json.dumps(audit_record)
        )
        print("Audit log successfully secured in immutable storage.")
        
        return {
            "status": "SUCCESS", 
            "audit_id": audit_record["AuditId"],
            "message": "Audit log saved to S3."
        }
    except ClientError as e:
        print(f"S3 Put Error: {e}")
        # Re-raise so Step Functions correctly fails the execution instead of succeeding
        raise e
