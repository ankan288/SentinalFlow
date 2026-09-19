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
                
        # Multi-Agent Peer Review Simulation
        print(f"[Agent 1 - Investigator] Drafting initial attack story for incident {incident_id}...")
        draft_score = random.uniform(0.60, 0.85)
        print(f"[Agent 2 - Peer Reviewer] Evaluating draft against raw logs... Confidence Score: {draft_score:.2f}")
        
        iteration = 1
        while draft_score < 0.90 and iteration <= 3:
            print(f"[Agent 2 - Peer Reviewer] REJECTED. Score too low. Requesting Agent 1 to regenerate.")
            time.sleep(0.5)
            print(f"[Agent 1 - Investigator] Regenerating attack story with deeper log analysis (Iteration {iteration})...")
            draft_score += random.uniform(0.05, 0.15)
            print(f"[Agent 2 - Peer Reviewer] Evaluating new draft... Confidence Score: {draft_score:.2f}")
            iteration += 1
            
        print("[Agent 2 - Peer Reviewer] APPROVED. Confidence threshold met. Releasing to human analyst.")
                
        return {
            "attack_story": f"The attacker performed a {event_type} attack.",
            "confidence_score": round(draft_score, 2),
            "peer_reviewed": True,
            "review_iterations": iteration,
            "recommended_actions": [
                {
                    "action_id": f"ACT-{action_type.upper()}",
                    "type": action_type,
                    "target": target_ip,
                    "description": f"{action_type} for the detected threat."
                }
            ]
        }
