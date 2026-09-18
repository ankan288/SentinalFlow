import json
import boto3
import os

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from services.authorization_service import require_role

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table_name = os.environ.get('INCIDENTS_TABLE_NAME', 'SentinelFlow-Incidents')
table = dynamodb.Table(table_name)

@require_role(['ANALYST', 'VIEWER'])
def lambda_handler(event, context):
    """
    Handles GET /incidents/{id}
    """
    path_parameters = event.get('pathParameters') or {}
    incident_id = path_parameters.get('id')
    
    if not incident_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Missing incident ID in path"})
        }
        
    try:
        response = table.get_item(Key={'IncidentId': incident_id})
        item = response.get('Item')
        
        if not item:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": f"Incident {incident_id} not found"})
            }
            
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(item)
        }
    except Exception as e:
        print(f"Error fetching incident {incident_id}: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error"})
        }
