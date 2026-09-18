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
        # For the hackathon, a paginated Scan is sufficient to return incidents for the dashboard.
        query_params = event.get('queryStringParameters') or {}
        limit_str = query_params.get('limit', '50')
        next_token = query_params.get('next_token')
        
        try:
            limit = int(limit_str)
            if limit <= 0 or limit > 100:
                raise ValueError()
        except ValueError:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "limit must be a positive integer between 1 and 100"})
            }
            
        scan_kwargs = {'Limit': limit}
        if next_token:
            import base64
            try:
                scan_kwargs['ExclusiveStartKey'] = json.loads(base64.b64decode(next_token).decode('utf-8'))
            except Exception:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"message": "Invalid next_token"})
                }
        
        response = table.scan(**scan_kwargs)
        incidents = response.get('Items', [])
        
        last_evaluated_key = response.get('LastEvaluatedKey')
        next_token_out = None
        if last_evaluated_key:
            import base64
            next_token_out = base64.b64encode(json.dumps(last_evaluated_key).encode('utf-8')).decode('utf-8')
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"incidents": incidents, "next_token": next_token_out})
        }
    except Exception as e:
        print(f"Error fetching incidents: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error"})
        }
