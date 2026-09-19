import time
import random

class AIAgentClient:
    """
    Client interface for Member 1's AI Agent.
    In production, this could trigger an asynchronous process, call Bedrock, or invoke an ECS task.
    """
    def __init__(self):
        pass

    def analyze_incident(self, incident_id, context_data):
        """
        Simulates Member 1's agent analyzing an incident and returning a structured schema.
        Handles timeout and service unavailable simulations.
        """
        # Simulate processing delay
        time.sleep(0.1)
            
        import json
        target_ip = "10.0.0.50"
        event_type = "brute-force"
        action_type = "BlockIP"
        
        if isinstance(context_data, dict):
            context_str = context_data.get('ContextData', '{}')
            try:
                context_json = json.loads(context_str)
                target_ip = context_json.get('source_ip', '10.0.0.50')
                event_type = context_json.get('event_type', 'brute-force')
                if 'user' in context_json:
                    target_ip = context_json.get('user')
                    action_type = "DisableUser"
            except:
                pass
                
        return {
            "attack_story": f"The attacker performed a {event_type} attack.",
            "confidence_score": 0.92,
            "recommended_actions": [
                {
                    "action_id": f"ACT-{action_type.upper()}",
                    "type": action_type,
                    "target": target_ip,
                    "description": f"{action_type} for the detected threat."
                }
            ]
        }
