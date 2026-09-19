# SentinelFlow API & Endpoint Verification Matrix

| Frontend Service / Function | HTTP Method | Endpoint Target | Backend Lambda / Service Exists | Live Response Valid | Integration Status |
|---|---|---|---|---|---|
| `getIncidents()` | `GET` | `/incidents` | `backend/functions/api/incidents_handler.py` | YES | CONNECTED |
| `getIncidentDetails(id)` | `GET` | `/incidents/{id}` | `backend/functions/api/incident_detail_handler.py` | YES | CONNECTED |
| `analyzeIncident(id)` | `POST` | `/incidents/{id}/analyze` | `backend/functions/api/analyze_handler.py` | YES | CONNECTED |
| `executeResponseAction(id)`| `POST` | `/actions` | `backend/functions/api/approve_action_handler.py` (EMPTY) | NO (Inline Mock) | DISCONNECTED |
| `getAttackStory(id)` | `GET` | `/attack-story` | `backend/functions/api/attack_story_handler.py` (EMPTY) | NO (Inline Mock) | DISCONNECTED |
| `getAuditLogs()` | `GET` | `/api/audit-logs` | `backend/functions/workflow/audit_handler.py` | NO (Inline Mock) | DISCONNECTED |

## Verification Findings

1. **Frontend Architecture**: Frontend UI is now partially connected to the live API via `incidentsService.ts` and `aiAnalystService.ts`. Unimplemented endpoints (like `approveAction`) still rely on safe inline mocks.
2. **Backend Architecture**: Backend consists of standalone AWS Lambda handlers in `backend/functions/` and a local Python orchestration pipeline (`backend/src/pipeline.py`).
3. **Connectivity**: The `GET /incidents`, `GET /incidents/{id}`, and `POST /incidents/{id}/analyze` endpoints have been verified and integrated into the frontend. `approve_action_handler.py` and `attack_story_handler.py` are empty files and require implementation.
