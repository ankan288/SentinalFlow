import json
import datetime
import uuid

def generate_audit_event(incident_id, action, executor):
    """
    Generates the standard schema for an audit event.
    """
    return {
        "AuditId": str(uuid.uuid4()),
        "Timestamp": datetime.datetime.now().isoformat() + "Z",
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
    
    # Simulate boto3 s3.put_object(Bucket=os.environ['AUDIT_BUCKET'], Key=..., Body=...)
    print("Audit log successfully secured in immutable storage.")
    
    return {
        "status": "SUCCESS", 
        "audit_id": audit_record["AuditId"],
        "message": "Audit log saved to S3."
    }
