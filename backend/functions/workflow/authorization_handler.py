import json

def evaluate_cedar_policy(principal_role, action, resource_type):
    """
    Simulates Amazon Verified Permissions (Cedar) evaluation engine based on our policies.cedar
    """
    # Forbid rule takes precedence
    if principal_role == "Agent" and action in ["DeleteData", "DisableInfrastructure", "ExecuteAction"]:
        return False, "Explicitly forbidden for Agent to execute destructive actions."
        
    # Permit rules
    if principal_role == "Admin":
        return True, "Admin is permitted all actions."
        
    if principal_role == "Agent" and action in ["Investigate", "SearchLogs", "CreateRecommendation"]:
        return True, "Agent is permitted to investigate and recommend."
        
    if principal_role == "Analyst" and action in ["BlockIP", "IsolateHost", "ExecuteAction"] and resource_type == "Incident":
        return True, "Analyst is permitted to execute mitigation actions on Incidents."
        
    return False, "Implicit Deny: No permit rule matched."

def lambda_handler(event, context):
    action = event.get('Action')
    incident_id = event.get('IncidentId')
    principal_role = event.get('PrincipalRole', 'Agent') # Default to agent for this workflow state
    
    print(f"Cedar Policy Evaluation Request:")
    print(f"  Principal: SentinelFlow::Role::\"{principal_role}\"")
    print(f"  Action: SentinelFlow::Action::\"{action}\"")
    print(f"  Resource: SentinelFlow::Resource::\"Incident\"")
    
    is_authorized, reason = evaluate_cedar_policy(principal_role, action, "Incident")
    
    print(f"Result: {'ALLOW' if is_authorized else 'DENY'} - {reason}")
    
    return {
        "Authorized": is_authorized,
        "Reason": reason
    }
