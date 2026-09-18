import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'workflow'))
from unittest.mock import MagicMock
sys.modules['boto3'] = MagicMock()
import authorization_handler
import execution_handler
import audit_handler

print("--- Testing Step Functions Workflow (Phase 8) ---")

state = {
    "IncidentId": "INC-001",
    "Action": "BlockIP",
    "PrincipalRole": "Analyst"
}

# State: AuthorizationCheck
print("\n[State: AuthorizationCheck]")
auth_result = authorization_handler.lambda_handler(state, None)
state["AuthResult"] = auth_result
print(f"Output: {auth_result}")

# State: IsAuthorized
if not state["AuthResult"]["Authorized"]:
    print("Transition to: AuthorizationFailed")
    sys.exit(1)

# State: WaitForHumanApproval
print("\n[State: WaitForHumanApproval]")
print("Step Functions pauses execution here.")
print("Waiting for an API callback with a TaskToken...")
print("... (Time passes) ...")
print("... API Gateway receives POST /actions/INC-001/approve ...")
print("... Lambda calls stepfunctions.send_task_success() ...")
state["ApprovalResult"] = {"Approved": True}
print(f"Callback received. Output: {state['ApprovalResult']}")

# State: IsApproved
if not state["ApprovalResult"]["Approved"]:
    print("Transition to: ActionRejected")
    sys.exit(0)
    
# State: ExecuteAction
print("\n[State: ExecuteAction]")
exec_result = execution_handler.lambda_handler(state, None)
state["ExecutionResult"] = exec_result
print(f"Output: {exec_result}")

# State: WriteAuditLog
print("\n[State: WriteAuditLog]")
audit_result = audit_handler.lambda_handler(state, None)
print(f"Output: {audit_result}")

print("\nWorkflow Execution Complete.")
