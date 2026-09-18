import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'functions', 'workflow'))
import authorization_handler

print("--- Testing Cedar Authorization Logic (Phase 9) ---")

print("\n[Scenario 1: AI Agent attempts to execute a destructive action]")
event_agent = {
    "Action": "ExecuteAction",
    "IncidentId": "INC-001",
    "PrincipalRole": "Agent"
}
authorization_handler.lambda_handler(event_agent, None)

print("\n[Scenario 2: Analyst attempts to execute a mitigation action]")
event_analyst = {
    "Action": "BlockIP",
    "IncidentId": "INC-001",
    "PrincipalRole": "Analyst"
}
authorization_handler.lambda_handler(event_analyst, None)

print("\n[Scenario 3: AI Agent attempts to create a recommendation]")
event_agent_rec = {
    "Action": "CreateRecommendation",
    "IncidentId": "INC-001",
    "PrincipalRole": "Agent"
}
authorization_handler.lambda_handler(event_agent_rec, None)
