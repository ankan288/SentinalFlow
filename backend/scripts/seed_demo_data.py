import boto3
import json
import time

events_client = boto3.client('events', region_name='us-east-1')

demo_events = [
    {
        "event_type": "brute_force",
        "source_ip": "192.168.1.55",
        "target": "auth_service",
        "details": "15 failed login attempts in 2 minutes"
    },
    {
        "event_type": "unauthorized_access",
        "source_ip": "10.0.0.12",
        "target": "customer_database",
        "details": "User attempted to access restricted tables without IAM role"
    },
    {
        "event_type": "data_exfiltration",
        "source_ip": "172.16.0.4",
        "target": "s3_bucket_finance",
        "details": "Unusual volume of data downloaded outside business hours"
    }
]

def seed_data():
    print("Seeding demo data into SentinelFlow EventBridge...")
    entries = []
    
    for event in demo_events:
        entries.append({
            'Source': 'com.sentinelflow.security',
            'DetailType': 'SecurityEvent',
            'Detail': json.dumps(event),
            'EventBusName': 'default'
        })
        
    try:
        response = events_client.put_events(Entries=entries)
        print(f"Successfully injected {len(entries)} security events into EventBridge!")
        print(f"Response: {response['Entries']}")
    except Exception as e:
        print(f"Failed to seed data: {e}")

if __name__ == "__main__":
    seed_data()
