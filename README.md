# SentinelFlow 🛡️

**SentinelFlow** is an AI-powered security incident investigation and response platform built entirely on AWS. Designed for the modern SOC (Security Operations Center), SentinelFlow bridges the gap between raw telemetry and actionable remediation by pairing human analysts with a powerful, Bedrock-driven AI Agent.

## 🚀 Key Features

- **Serverless First:** Built entirely on AWS Serverless infrastructure (Lambda, API Gateway, Step Functions) for infinite scalability and zero idle costs.
- **AI-Powered Analysis:** Leverages generative AI (Amazon Bedrock) to automatically correlate logs, generate "Attack Stories", and recommend tactical mitigation actions.
- **Human-in-the-Loop (HITL) Workflows:** Critical actions (like blocking IPs or isolating instances) are orchestrated via AWS Step Functions, which pause to enforce mandatory human approval.
- **Fine-Grained Authorization:** Protects sensitive endpoints using a hybrid of Amazon Cognito (for RBAC) and Amazon Cedar (for fine-grained policy evaluation).
- **Immutable Auditing:** WORM-compliant (Write Once, Read Many) S3 storage ensures all approved actions and mitigation commands are permanently logged and tamper-proof.

## 🏗️ Architecture (SHIP IT Track)

SentinelFlow aligns perfectly with the AWS Hackathon **SHIP IT** track:

| Category | Service Used | Purpose |
| :--- | :--- | :--- |
| **Serverless** | AWS Lambda, API Gateway, Step Functions | Core compute, REST APIs, and Workflow Orchestration |
| **Agents and AI** | Amazon Bedrock (via AI Agent Client) | Threat intelligence and automated Attack Story generation |
| **Data and Search** | Amazon DynamoDB, OpenSearch, S3 | Incident state, raw telemetry indexing, and immutable audit vaults |
| **Auth and Policy** | Amazon Cognito (and Cedar) | Identity provider, API RBAC, and granular workflow policies |

## 🛠️ Project Structure

```text
SentinelFlow/
├── backend/                  # AWS SAM Serverless Backend
│   ├── functions/            # AWS Lambda handlers (API, Events, Workflows)
│   ├── src/                  # Core logic, AI Agent integration, and Auth middleware
│   └── template.yaml         # IaC definition for SAM deployment
├── frontend/                 # React UI (Vite + TypeScript)
│   ├── src/services/         # API clients connecting to AWS API Gateway
│   └── src/components/       # UI Components (Dashboards, Incident Tables)
├── docs/                     # Project documentation and reports
└── verification/             # API Verification matrices and integration status
```

## 👥 Contributors

- **Anusmita Ray Chaudhuri** — AI / Agent Engineering & Security Intelligence
- **Anirban Ray** — Cybersecurity + Data + Validation

---
*Built for the AWS Hackathon 2026*
