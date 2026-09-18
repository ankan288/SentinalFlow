# SentinelFlow Data Flow Architecture

## 1. Event Ingestion & Detection (Member 2)
- **Sources**: Firewalls, VPC Flow Logs, CloudTrail.
- **Bus**: Amazon EventBridge (`com.sentinelflow.security`).
- **Detection**: Member 2's Logic (Lambda) analyzes raw payload. If it's a threat, it saves to **DynamoDB (Incidents Table)**.
- **Search Index**: Events are funneled into **Amazon OpenSearch** for AI agent investigation.

## 2. Agent Analysis (Member 1)
- **API Call**: Frontend calls `POST /incidents/{id}/analyze`.
- **Lambda Orchestrator**: Authenticates via **Cognito**, authorizes via **Cedar**, and invokes Member 1's Agent.
- **Action Recommendation**: Agent returns structured JSON proposing a mitigation (e.g. `BLOCK_IP`).

## 3. Mitigation Execution (Member 4)
- **Step Functions**: Triggered with proposed action.
- **Pause**: State machine pauses using `.waitForTaskToken`.
- **Human Approval**: Admin views the UI (Member 3) and clicks Approve.
- **Execution**: Lambda updates WAF / IAM to mitigate.
- **Audit Logging**: Immutable record saved to **S3 (WORM)**.
