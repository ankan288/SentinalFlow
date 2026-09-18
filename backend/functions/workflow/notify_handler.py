import json
import boto3
import datetime

sf_client = boto3.client('stepfunctions', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Mock NotifyHuman that automatically approves actions for hackathon demo.
    """
    task_token = event.get('TaskToken')
    incident_id = event.get('IncidentId')
    action = event.get('Action')
    executor = event.get('Executor', 'System')

    print(f"Notifying human for Incident {incident_id} to approve {action}")
    
    # Mocking human approval
    approval_payload = {
        "Approved": True,
        "Approver": "mock-admin@sentinelflow.io",
        "ApprovalTime": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "Executor": executor
    }
    
    try:
        if task_token:
            sf_client.send_task_success(
                taskToken=task_token,
                output=json.dumps({"Payload": approval_payload})
            )
            print("Successfully sent task success to Step Functions.")
        else:
            print("No TaskToken provided. This is likely a test execution.")
            
        return approval_payload
    except Exception as e:
        print(f"Error sending task success: {e}")
        raise
