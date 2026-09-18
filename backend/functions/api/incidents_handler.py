import json
import boto3
import os

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from services.authorization_service import require_role

# Initialize DynamoDB client (boto3 will use local credentials/roles when deployed)
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table_name = os.environ.get('INCIDENTS_TABLE_NAME', 'SentinelFlow-Incidents')
table = dynamodb.Table(table_name)

@require_role(['ANALYST', 'VIEWER'])
def lambda_handler(event, context):
    """
    Handles GET /incidents
    """
    try:
        # In a production scenario with millions of incidents, we'd Query the GSI by Status.
        # For the hackathon, a Scan is sufficient to return all incidents for the dashboard.
        response = table.scan()
        incidents = response.get('Items', [])
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"incidents": incidents})
        }
    except Exception as e:
        print(f"Error fetching incidents: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error"})
        }
