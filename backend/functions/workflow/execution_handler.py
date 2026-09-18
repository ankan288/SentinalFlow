import json
import boto3

def lambda_handler(event, context):
    action = event.get('Action')
    target = event.get('Target')
    incident_id = event.get('IncidentId')
    
    print(f"Executing action on infrastructure: {action} on target: {target} for Incident: {incident_id}")
    
    if not action or not target:
        return {"status": "ERROR", "details": "Missing Action or Target parameter"}
        
    try:
        if action == "BlockIP":
            # Functional mock - in reality we would update a WAF IP set here
            print(f"WAF API called to block IP: {target}")
            details = f"Successfully updated WAF to block {target}"
        elif action == "IsolateHost":
            # Functional mock - in reality we would use EC2 security groups
            print(f"EC2 API called to isolate host: {target}")
            details = f"Successfully isolated host {target}"
        elif action == "DisableUser":
            # Functional mock - in reality we would disable IAM/Cognito user
            print(f"IAM API called to disable user: {target}")
            details = f"Successfully disabled user {target}"
        else:
            return {"status": "ERROR", "details": f"Unknown action type: {action}"}
            
        return {"status": "SUCCESS", "details": details}
    except Exception as e:
        print(f"Execution failed: {str(e)}")
        return {"status": "ERROR", "details": f"Infrastructure API call failed: {str(e)}"}
