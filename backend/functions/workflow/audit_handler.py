import json
import datetime
import uuid
import os
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client('s3', region_name='us-east-1')
bucket_name = os.environ.get('AUDIT_BUCKET', 'SentinelFlow-AuditLogs')

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
    
    # In reality, executor comes from the TaskToken context
    executor = event.get('Executor', 'Analyst: admin_user') 
    
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
        # Note: In production we would raise the exception to fail the workflow
        # raise e
        return {
            "status": "ERROR",
            "message": "Failed to write audit log to S3."
        }
