import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))
from services.telemetry_service import ingest_real_telemetry_event


def lambda_handler(event, context):
    """
    Handles POST /events/telemetry (Real Login & Auth Telemetry Ingestion)
    Extracts server-side client IP, Cognito claims, User-Agent header,
    and ingests real events into the detection pipeline.
    """
    try:
        method = event.get('httpMethod', 'POST')
        if method == 'OPTIONS':
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
                    "Access-Control-Allow-Methods": "POST,OPTIONS"
                },
                "body": json.dumps({"message": "OK"})
            }

        body_str = event.get('body') or '{}'
        try:
            payload = json.loads(body_str)
        except Exception:
            payload = {}

        result = ingest_real_telemetry_event(event, payload)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(result)
        }
    except Exception as e:
        print(f"Error processing real telemetry event: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"message": "Internal server error", "error": str(e)})
        }
