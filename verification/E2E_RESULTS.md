# Phase 1: Canonical End-to-End Execution Results

## Scenario Summary
- **Dataset**: `shared/demo/sentinelflow-demo.json` (Northgate Institute of Technology Compromise Timeline)
- **Total Ingested Events**: 31
- **Validated**: 31 | **Rejected**: 0

---

## Unified Entity Map
- **Incident ID**: `INC-0001-1`
- **Target User ID**: `u-8823`
- **Source IP**: `203.0.113.77`
- **Compromised Device ID**: `dev-unknown-902`
- **Target Resource**: `srv-grades-db`

---

## Pipeline Execution Trace

### 1. Detections Fired
| Rule ID | Rule Name | Severity | Entities | Related Events |
|---|---|---|---|---|
| `RULE-001` | Brute Force Attempt | `MEDIUM` | `{'source_ip': '203.0.113.77'}` | 27 failed login events |
| `RULE-002` | Credential Compromise Suspected | `HIGH` | `{'source_ip': '203.0.113.77', 'user_id': 'u-8823'}` | 28 events (27 fails + 1 success) |
| `RULE-003` | Privilege Escalation After New Device | `HIGH` | `{'user_id': 'u-8823', 'device_id': 'dev-unknown-902'}` | 2 events (device login + role change) |
| `RULE-004` | Unusual Sensitive Resource Access | `HIGH` | `{'user_id': 'u-8823', 'resource': 'srv-grades-db'}` | 1 resource access event |

### 2. Evidence Items & Grounding
- **Total Evidence Items**: 7 (`E1` through `E7`)
- **Anti-Fabrication Check**: **PASSED** (0 hallucinated event/entity IDs)
  - `E1`: 27 failed logins from `203.0.113.77` (`09:41:04` – `09:42:49`)
  - `E2`: 27 failed logins from `203.0.113.77` (`09:41:04` – `09:42:49`)
  - `E3`: Successful login for `u-8823` from `203.0.113.77` at `09:43:21` (32s post failure)
  - `E4`: Login from unseen device `dev-unknown-902` for `u-8823` at `09:44:06`
  - `E5`: Role escalation (`student` -> `student_admin_assistant`) for `u-8823` at `09:45:16`
  - `E6`: `u-8823` accessed sensitive database `srv-grades-db` at `09:46:21`
  - `E7`: No historical access baseline for `u-8823` on `srv-grades-db`

### 3. AI Investigation Narrative
- **Synthesized Attack Stage**: `sensitive_data_access`
- **Assessed Severity**: `HIGH` (Confidence: `high`)
- **Summary**: *"Security investigation for INC-0001-1: Detection rules ['RULE-001', 'RULE-002', 'RULE-003', 'RULE-004'] fired sequentially. Observed activity demonstrates a multi-stage compromise involving failed authentication bursts transitioning into account access and privilege elevation [E1] [E2] [E3] [E4] [E5] [E6] [E7]."*

### 4. Cedar Authorization & Human Approval Gate
- **Actor Principal**: `SentinelFlow::User::"analyst_jordan"`
- **Context**: `analyst_approved=True`, `admin_approved=False`, `mfa_authenticated=False`

| Action ID | Action Type | Target Resource | Risk Level | Cedar Decision | Reasons | Execution Result |
|---|---|---|---|---|---|---|
| `ACT-001` | `disable_user_account` | `u-8823` | `MEDIUM` | `ALLOW` | `['policy2']` | `EXECUTED_SIMULATED` |
| `ACT-002` | `revoke_active_sessions` | `u-8823` | `MEDIUM` | `ALLOW` | `['policy2']` | `EXECUTED_SIMULATED` |
| `ACT-003` | `block_source_ip` | `203.0.113.77` | `HIGH` | `DENY` | `[]` (Admin+MFA required) | `BLOCKED_BY_POLICY` |

### 5. Append-Only Audit Trail Records
- `aud-000001`: `analyst_jordan` | `execute_remediation` (`ACT-001`) -> `ALLOW`
- `aud-000002`: `analyst_jordan` | `execute_remediation` (`ACT-002`) -> `ALLOW`
- `aud-000003`: `analyst_jordan` | `execute_remediation` (`ACT-003`) -> `DENY`

---

## Entity Consistency Check
- **User ID**: `u-8823` stayed consistent across Ingestion -> Detection -> Correlation -> Evidence -> AI -> Authorization -> Action -> Audit.
- **Source IP**: `203.0.113.77` stayed consistent across Ingestion -> Rule 001/002 -> Correlation -> Evidence E1/E2/E3.
- **Device ID**: `dev-unknown-902` stayed consistent across Ingestion -> Rule 003 -> Correlation -> Evidence E4.
- **Resource**: `srv-grades-db` stayed consistent across Ingestion -> Rule 004 -> Correlation -> Evidence E6/E7.

**Phase 1 Result**: **PASS** (100% entity consistency and end-to-end stage completion).
