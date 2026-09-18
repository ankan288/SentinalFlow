import json

def lambda_handler(event, context):
    """
    Triggered asynchronously by EventBridge when a new security event occurs.
    """
    print(f"Received EventBridge event: {json.dumps(event)}")
    
    # EventBridge places the payload inside the 'detail' object
    detail = event.get('detail', {})
    event_type = detail.get('event_type')
    source_ip = detail.get('source_ip')
    
    if not event_type or not source_ip:
        print("Invalid event payload. Skipping.")
        return
        
    print(f"Processing event {event_type} from {source_ip}")
    
    # In a real environment, this Lambda calls Member 2's Detection Logic
    # Example:
    # is_threat, severity = detector.evaluate(detail)
    # if is_threat:
    #     incident_service.create_incident(...)
    
    print("Event processed successfully. Handoff to detection logic complete.")
