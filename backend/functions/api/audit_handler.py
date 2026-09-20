import json
import os
import boto3
from botocore.exceptions import ClientError
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from services.authorization_service import require_role

s3 = boto3.client('s3', region_name='us-east-1')
bucket_name = os.environ.get('AUDIT_BUCKET')

@require_role(['ADMIN', 'ANALYST', 'VIEWER'])
def lambda_handler(event, context):
    """
    Handles GET /audit
    Fetches all audit logs from the S3 bucket.
    """
    if not bucket_name:
        return {"statusCode": 500, "body": json.dumps({"message": "AUDIT_BUCKET environment variable is not set"})}

    try:
        # List all objects in the audit prefix
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix='audit/')
        
        audit_logs = []
        if 'Contents' in response:
            for obj in response['Contents']:
                # Read the object
                obj_response = s3.get_object(Bucket=bucket_name, Key=obj['Key'])
                log_data = json.loads(obj_response['Body'].read().decode('utf-8'))
                audit_logs.append(log_data)
                
        # Sort by timestamp descending
        audit_logs.sort(key=lambda x: x.get('Timestamp', ''), reverse=True)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"audit_logs": audit_logs})
        }
        
    except ClientError as e:
        print(f"Error fetching audit logs from S3: {e}")
        return {"statusCode": 500, "body": json.dumps({"message": "Failed to fetch audit logs"})}
