import json

import os
import re

def evaluate_cedar_policy(principal_role, action, resource_type):
    """
    Simulates Amazon Verified Permissions (Cedar) evaluation engine by parsing policies.cedar.
    """
    policy_path = os.path.join(os.path.dirname(__file__), '..', '..', 'infrastructure', 'cedar', 'policies.cedar')
    if not os.path.exists(policy_path):
        return False, "Policy file not found."
        
    try:
        with open(policy_path, 'r') as f:
            policies = f.read()
    except Exception as e:
        return False, f"Failed to read policy: {e}"
        
    # Basic regex parser for the hackathon simulation
    statements = re.findall(r'(permit|forbid)\s*\((.*?)\);', policies, re.DOTALL)
    
    is_authorized = False
    reason = "Implicit Deny: No permit rule matched."
    
    principal_role = principal_role.upper()
    principal_str = f'SentinelFlow::Role::"Admin"' if principal_role == 'ADMIN' else (
        f'SentinelFlow::Role::"Analyst"' if principal_role == 'ANALYST' else f'SentinelFlow::Role::"Agent"'
    )
    action_str = f'SentinelFlow::Action::"{action}"'
    resource_str = f'SentinelFlow::Resource::"{resource_type}"'
    
    for effect, conditions in statements:
        if 'principal in ' in conditions and principal_str not in conditions:
            continue
            
        if 'action in [' in conditions:
            actions_match = re.search(r'action in \[(.*?)\]', conditions, re.DOTALL)
            if actions_match and action_str not in actions_match.group(1):
                continue
                
        if 'resource ==' in conditions and resource_str not in conditions:
            continue
            
        if effect == 'forbid':
            return False, "Explicitly forbidden."
        elif effect == 'permit':
            is_authorized = True
            reason = "Permit rule matched."
            
    return is_authorized, reason

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
