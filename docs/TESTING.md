# SentinelFlow Testing & Verification Guide

Welcome to the testing guide for SentinelFlow! This document provides instructions for team members on how to run, test, and verify the backend APIs and frontend UI both locally and against the deployed AWS cloud infrastructure.

---

## 1. Local Backend Pipeline Testing (Without AWS)

If you just want to test the Python logic, data models, or orchestration without deploying to AWS, you can run the local demo pipeline.

1. **Open your terminal** and navigate to the project root (`d:\AWS`).
2. **Run the demo script:**
   ```powershell
   py -3.13 demo/run_demo.py
   ```
3. **What to expect:**
   - The script simulates an entire end-to-end attack scenario.
   - It will output mock OpenSearch results, simulate RBAC access controls, and generate an AI Attack Story via the mocked `ai_agent_client.py`.
   - It will finally simulate an immutable audit log being written to S3.

## 2. Frontend UI Testing (Connected to Live AWS)

The React frontend has been successfully integrated with the **live AWS API Gateway**. To see the UI and test the data flow:

1. **Navigate to the frontend folder:**
   ```powershell
   cd frontend
   ```
2. **Start the development server:**
   ```powershell
   npm run dev
   ```
3. **Open your browser** to the `localhost` URL provided in the terminal.
4. **What to verify:**
   - **Dashboard:** The "Active Incidents" list on the dashboard should load data directly from your deployed DynamoDB table.
   - **Incidents Page:** The main table should populate with live incidents. Try using the Search bar at the top of the page; it filters the live incidents.
   - **AI Analyst Panel:** Click on a specific incident to open the details view. The AI Analyst panel will send a real `POST /incidents/{id}/analyze` request to the cloud. You should see a loading spinner before the AI response populates.

## 3. Backend Verification (AWS SAM)

When your teammates make changes to the backend (e.g., in `backend/functions/api/`), they need to build and deploy those changes to AWS.

### Building the Backend
1. **Navigate to the backend folder:**
   ```powershell
   cd backend
   ```
2. **Build the SAM template:**
   ```powershell
   sam build
   ```
   *Note: If you encounter Python binary errors during build, ensure your Docker is running or your local Python 3.12+ paths are configured correctly.*

### Deploying the Backend
To push changes to the live AWS environment:
```powershell
sam deploy --guided
```
- Accept the default stack name (`SentinelFlowStack`).
- This will provision/update the Lambda functions, API Gateway, DynamoDB tables, and IAM roles in your AWS account.

## 4. Troubleshooting & Known Limitations

- **Empty Handlers:** Currently, `approve_action_handler.py` and `attack_story_handler.py` are empty files. If you test the "Approve Action" button in the UI, the frontend will use a safe mock response (to prevent crashing) until you fully implement those Lambda functions.
- **TypeScript Errors:** If you make changes to the frontend `incidentsService.ts` types, run `npm run build` from the `frontend/` directory to ensure you haven't broken the strict Vite compiler rules (specifically `verbatimModuleSyntax`).

---
**Happy Testing!** If you hit any issues with the cloud deployment, check the CloudWatch Logs for your specific Lambda function in the AWS Console.
