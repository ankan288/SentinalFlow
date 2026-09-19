# SentinelFlow API & Endpoint Verification Matrix

| Frontend Service / Function | HTTP Method | Endpoint Target | Backend Lambda / Service Exists | Live Response Valid | Integration Status |
|---|---|---|---|---|---|
| `getIncidents()` | `GET` | `/api/incidents` | `backend/functions/api/incidents_handler.py` | NO (Inline Mock) | DISCONNECTED |
| `getIncidentDetails(id)` | `GET` | `/api/incidents/:id` | `backend/functions/api/incident_detail_handler.py` | NO (Inline Mock) | DISCONNECTED |
| `analyzeIncident(id)` | `POST` | `/api/analysis` | `backend/functions/api/analyze_handler.py` | NO (Unused) | DISCONNECTED |
| `executeResponseAction(id)`| `POST` | `/api/actions` | `backend/functions/api/approve_action_handler.py` | NO (Inline Mock) | DISCONNECTED |
| `getAttackStory(id)` | `GET` | `/api/attack-story` | `backend/functions/api/attack_story_handler.py` | NO (Inline Mock) | DISCONNECTED |
| `getAuditLogs()` | `GET` | `/api/audit-logs` | `backend/functions/workflow/audit_handler.py` | NO (Inline Mock) | DISCONNECTED |

## Verification Findings

1. **Frontend Architecture**: Frontend UI uses simulated delays (`setTimeout`) and hardcoded React state / mock data arrays in `frontend/src/api/`. No network HTTP/REST calls are dispatched to any backend server.
2. **Backend Architecture**: Backend consists of standalone AWS Lambda handlers in `backend/functions/` and a local Python orchestration pipeline (`backend/src/pipeline.py`).
3. **Connectivity**: Frontend and Backend exist as separate, unintegrated layers. The Python pipeline (`py -3.13 demo/run_demo.py`) operates deterministically and correctly via CLI, while the UI operates strictly via static mock state.
