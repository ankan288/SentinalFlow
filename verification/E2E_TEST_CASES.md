# SentinelFlow End-to-End Test Case Verification Matrix

| Test Case ID | Feature / Boundary | Domain | Expected Behavior | Observed Behavior | Status |
|---|---|---|---|---|---|
| `TC-E2E-01` | Event Ingestion & Deduplication | Pipeline (Backend) | 31 events validated against schema; duplicate IDs rejected | 31 validated, 0 rejected | PASS |
| `TC-E2E-02` | Deterministic Rule Detection | Pipeline (Backend) | `RULE-001`..`RULE-004` fire deterministically (LLM-free) | 4 detections fired matching scenario | PASS |
| `TC-E2E-03` | Attack Chain Correlation | Pipeline (Backend) | Entity overlap groups detections into `INC-0001-1` | Attack chain generated with 4 stages | PASS |
| `TC-E2E-04` | Evidence Engine & Anti-Fabrication | Pipeline (Backend) | Evidence items `[E1]`..`[E7]` generated; 0 hallucinated IDs | `validate_no_fabrication()` passed | PASS |
| `TC-E2E-05` | Grounded AI Investigation | AI / Pipeline | Narrative generated with evidence refs; schema validated | Schema valid, 3 action proposals | PASS |
| `TC-E2E-06` | AWS Cedar Authorization | Cedar (TB-5) | Medium risk allowed with approval; High risk denied without Admin+MFA | Cedar decision: ALLOW for ACT-001/002, DENY for ACT-003 | PASS |
| `TC-E2E-07` | Append-Only Audit Trail | Audit (C-09) | Decisions logged to store; deletion raises `PermissionError` | 3 audit records created; deletion blocked | PASS |
| `TC-E2E-08` | Prompt Injection Resilience | Security (T-06) | Malicious string in username field ignored by detector | Detection output 100% identical | PASS |
| `TC-E2E-09` | AI Direct Action Execution | Security (TB-5) | AI principal attempting `execute_remediation` DENIED | Cedar explicit forbid (`policy06`) | PASS |
| `TC-E2E-10` | Privilege Escalation Block | Security (TB-5) | Analyst attempting to modify security rules DENIED | Cedar default deny | PASS |
| `TC-E2E-11` | Cross-Incident Target Mismatch | Security (TB-5) | Remediation targeting non-incident resource DENIED | Cedar explicit forbid (`policy11`) | PASS |
| `TC-UI-01` | Incident INC-047 Dashboard Display | Frontend UI | UI displays INC-047 details, graph, AI, response | Hardcoded mock UI renders INC-047 | PARTIAL (Mock) |
| `TC-UI-02` | Non-Existent Incident Route | Frontend UI | Graceful 404 / Error state for `/incidents/DOES-NOT-EXIST` | Renders "Insufficient Data for id" text | FAIL |
| `TC-UI-03` | Live AI Analyst Querying | Frontend UI | Analyst can input prompt (e.g. "Weather in Kolkata") | UI has hardcoded text; no input box | FAIL |
| `TC-UI-04` | Audit Log UI Data Source | Frontend UI | UI renders live audit log from backend pipeline | UI renders hardcoded `AL-9001` array | FAIL |
