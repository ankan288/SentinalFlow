import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from integrations.ai_agent_client import AIAgentClient
from services.authorization_service import require_role

def get_incident_from_db(incident_id):
    if not incident_id:
        return None
    return {"IncidentId": incident_id, "Status": "OPEN", "Description": "Suspicious login activity"}

def save_analysis_to_db(incident_id, analysis):
    # Simulated DB write for hackathon context
    pass

@require_role(['ANALYST', 'ADMIN'])
def lambda_handler(event, context):
    """
    Handles POST /incidents/{id}/analyze
    """
    path_parameters = event.get('pathParameters') or {}
    incident_id = path_parameters.get('id')
    
    if not incident_id:
        return {"statusCode": 400, "body": json.dumps({"message": "Malformed input: Missing incident ID"})}
        
    incident = get_incident_from_db(incident_id)
    if not incident:
        return {"statusCode": 404, "body": json.dumps({"message": "Incident not found"})}
        
    agent = AIAgentClient()
    
    try:
        # Pass context to Member 1's AI agent
        analysis_result = agent.analyze_incident(incident_id, incident)
        
        # Validate AI response structure (schema check)
        if "attack_story" not in analysis_result or "recommended_actions" not in analysis_result:
            return {"statusCode": 502, "body": json.dumps({"message": "Invalid AI response schema"})}
            
        # Save structured analysis to DB
        save_analysis_to_db(incident_id, analysis_result)
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "message": "Analysis complete",
                "analysis": analysis_result
            })
        }
        
    except TimeoutError:
        return {"statusCode": 504, "body": json.dumps({"message": "Timeout: AI Analysis took too long"})}
    except Exception as e:
        print(f"Agent analysis failed: {str(e)}")
        return {"statusCode": 503, "body": json.dumps({"message": "Service unavailable: AI Agent failure"})}
