import json
import os
import sys

for src_path in (
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'src')),
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')),
):
    if os.path.isdir(src_path) and src_path not in sys.path:
        sys.path.append(src_path)
        break
from integrations.ai_agent_client import AIAgentClient
from services.authorization_service import require_role

import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
sf_client = boto3.client('stepfunctions', region_name='us-east-1')
table_name = os.environ.get('INCIDENTS_TABLE_NAME', 'SentinelFlow-Incidents')
table = dynamodb.Table(table_name)
state_machine_arn = os.environ.get('STATE_MACHINE_ARN')

def get_incident_from_db(incident_id):
    if not incident_id:
        return None
    try:
        response = table.get_item(Key={'IncidentId': incident_id})
        return response.get('Item')
    except ClientError as e:
        print(f"DynamoDB Error: {e}")
        raise

def save_analysis_to_db(incident_id, analysis):
    try:
        table.update_item(
            Key={'IncidentId': incident_id},
            UpdateExpression="set Analysis = :a, #S = :s",
            ExpressionAttributeNames={'#S': 'Status'},
            ExpressionAttributeValues={
                ':a': analysis,
                ':s': 'ANALYZED'
            }
        )
    except ClientError as e:
        print(f"DynamoDB Update Error: {e}")
        raise

@require_role(['ANALYST', 'ADMIN'])
def lambda_handler(event, context):
    """
    Handles POST /incidents/{id}/analyze
    """
    path_parameters = event.get('pathParameters') or {}
    incident_id = path_parameters.get('id')
    
    if not incident_id:
        return {"statusCode": 400, "body": json.dumps({"message": "Malformed input: Missing incident ID"})}
        
    try:
        incident = get_incident_from_db(incident_id)
    except ClientError:
        return {"statusCode": 500, "body": json.dumps({"message": "Database error: unable to retrieve incident"})}

    if not incident:
        return {"statusCode": 404, "body": json.dumps({"message": "Incident not found"})}
        
    # Extract identity from API Gateway Custom Authorizer Context
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    executor = claims.get('email', 'unknown_executor')
    # Use roles if present, otherwise default
    groups = claims.get('cognito:groups', '["AGENT"]')
    import json
    if isinstance(groups, str):
        try:
            groups = json.loads(groups)
        except json.JSONDecodeError:
            groups = [groups.strip('[]"\' ')]
    principal_role = groups[0] if isinstance(groups, list) and len(groups) > 0 else 'AGENT'

    agent = AIAgentClient()
    
    try:
        # Pass context to Member 1's AI agent
        analysis_result = agent.analyze_incident(incident_id, incident)
        
        # Validate AI response structure (schema check)
        if "attack_story" not in analysis_result or "recommended_actions" not in analysis_result:
            return {"statusCode": 502, "body": json.dumps({"message": "Invalid AI response schema"})}
            
        # Save structured analysis to DB
        save_analysis_to_db(incident_id, analysis_result)
        
        # Trigger the response workflow
        try:
            workflow_input = {
                "IncidentId": incident_id,
                "Action": analysis_result["recommended_actions"][0]["type"],
                "Target": analysis_result["recommended_actions"][0]["target"],
                "Executor": executor,
                "PrincipalRole": principal_role
            }
            if not state_machine_arn:
                raise ValueError("STATE_MACHINE_ARN environment variable is not set")
            sf_client.start_execution(
                stateMachineArn=state_machine_arn,
                input=json.dumps(workflow_input)
            )
        except Exception as e:
            print(f"Workflow Trigger Error: {e}")
            return {"statusCode": 500, "body": json.dumps({"message": "Failed to trigger response workflow"})}
        
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
