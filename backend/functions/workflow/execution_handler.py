def lambda_handler(event, context):
    print(f"Executing action on infrastructure: {event.get('Action')} for Incident: {event.get('IncidentId')}")
    # In a real scenario, this calls AWS APIs (e.g. WAF to block IP, IAM to disable user)
    return {"status": "SUCCESS", "details": "Action executed successfully on target infrastructure"}
