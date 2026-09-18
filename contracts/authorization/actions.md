# SentinelFlow — Authorization Actions & Policy Contract

**Document Owner:** Member 4 (Cybersecurity Engineering + Detection + Validation Lead)  
**Implementation Owner:** Member 2 (AWS/Backend/Auth Lead)  
**Target Consumers:** Member 1 (AI Agent Lead), Member 3 (Frontend Lead)  
**Hackathon:** WeMakeDevs × AWS — First Commit, Sep 17–20, 2026  
**Team:** Team Olympus  
**Status:** Phase 8 — Confirmed Contract  

---

## 1. Executive Summary & Purpose

This contract formalizes the authorization boundary (**TB-5**) of the SentinelFlow system using **AWS Cedar**. It defines the enforceable access control rules separating human SOC analysts, security administrators, auditors, and the AI Investigator agent.

> [!CRITICAL]
> **Core Authorization Invariants:**
> 1. **Default Deny:** Any request not explicitly granted by an active Cedar policy evaluates strictly to `DENY`.
> 2. **AI Output Is NOT Authorization:** The AI Investigator generates *proposals* (`TL-4`), never authorization decisions. Cedar re-evaluates every request against server-side ground truth.
> 3. **Mandatory Human-in-the-Loop:** High-risk and medium-risk remediation actions require verified human confirmation (`TB-6`) before Cedar permits execution.
> 4. **Append-Only Audit Log:** Audit log deletion is globally forbidden (`forbid`) for all actors without exception.
> 5. **Fail-Closed:** Policy parsing errors, malformed contexts, or missing attributes always evaluate to `DENY`.

---

## 2. Actors & Principals Taxonomy

| Principal UID | Entity Type | Role Membership | Description |
|---|---|---|---|
| `SentinelFlow::User::"<username>"` | `User` | `Role::"SecurityAnalyst"` | SOC Analyst investigating incidents, reviewing evidence, and approving medium-risk remediation. |
| `SentinelFlow::User::"<username>"` | `User` | `Role::"SecurityAdmin"` | Elevated Security Administrator capable of approving high-risk actions and modifying detection rules. |
| `SentinelFlow::User::"<username>"` | `User` | `Role::"Auditor"` | Compliance and audit officer with read-only inspection access to audit logs and incidents. |
| `SentinelFlow::Service::"ai_agent"` | `Service` | None (Sandboxed) | AI Security Investigator (Member 1). Restricted to reading evidence, synthesizing timelines, and proposing actions. |
| `SentinelFlow::Service::"detector_service"` | `Service` | None (Internal) | Ingestion and deterministic detection pipeline. Emits verified incidents and evidence bundles. |

---

## 3. Resources Taxonomy

| Resource UID Pattern | Entity Type | Sensitivity | Permitted Readers | Permitted Modifiers |
|---|---|---|---|---|
| `SentinelFlow::Incident::"<incident_id>"` | `Incident` | High | Analyst, Admin, Auditor, AI Agent | Detector Service |
| `SentinelFlow::Evidence::"<evidence_bundle_id>"` | `Evidence` | High | Analyst, Admin, Auditor, AI Agent | Evidence Engine (Immutable) |
| `SentinelFlow::Asset::"<asset_id>"` | `Asset` | Medium | Analyst, Admin, AI Agent | IT Admin |
| `SentinelFlow::Investigation::"<inv_id>"` | `Investigation` | Medium | Analyst, Admin, Auditor | AI Agent, Analyst |
| `SentinelFlow::ResponseAction::"<action_id>"` | `ResponseAction` | Critical | Analyst, Admin | Backend Worker (Post-Approval) |
| `SentinelFlow::SecurityRule::"<rule_id>"` | `SecurityRule` | Critical | Analyst, Admin | Security Admin (MFA required) |
| `SentinelFlow::AuditLog::"system_audit_log"` | `AuditLog` | High | Admin, Auditor | Backend System (Append-only) |

---

## 4. Actions Taxonomy & Risk Classification

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              ACTION RISK TAXONOMY                                │
├─────────────────────────┬─────────────────────────┬──────────────────────────────┤
│        LOW RISK         │       MEDIUM RISK       │          HIGH RISK           │
│   (Automated Allowed)   │ (Analyst Approval Gate) │   (Admin Approval + MFA)     │
├─────────────────────────┼─────────────────────────┼──────────────────────────────┤
│ • read_incident         │ • approve_remediation   │ • execute_remediation (High) │
│ • read_event            │ • execute_remediation   │ • modify_security_rule       │
│ • read_evidence         │   (Low/Med Risk Only)   │                              │
│ • read_asset            │ • create_investigation  │                              │
│ • view_audit_log        │ • propose_remediation   │                              │
└─────────────────────────┴─────────────────────────┴──────────────────────────────┘
```

### Detailed Action Specifications

| Action UID | Risk Tier | Permitted Principals | Target Resource | Human Gate Required? | Description |
|---|---|---|---|---|---|
| `Action::"read_incident"` | `LOW` | Analyst, Admin, Auditor, AI Agent | `Incident` | No | Inspect incident metadata, status, and timeline. |
| `Action::"read_event"` | `LOW` | Analyst, Admin, Auditor | `Incident` | No | Inspect underlying raw events associated with incident. |
| `Action::"read_evidence"` | `LOW` | Analyst, Admin, Auditor, AI Agent | `Evidence`, `Incident` | No | Inspect verified evidence bundle (`E1, E2...`). |
| `Action::"read_asset"` | `LOW` | Analyst, Admin, AI Agent | `Asset` | No | Query asset criticality, owner, and role baseline. |
| `Action::"view_audit_log"` | `LOW` | Admin, Auditor | `AuditLog` | No | View append-only investigation and decision audit trails. |
| `Action::"create_investigation"`| `MEDIUM`| Analyst, Admin, AI Agent | `Incident` | No | Publish structured investigation narrative and MITRE mapping. |
| `Action::"propose_remediation"` | `MEDIUM`| Analyst, Admin, AI Agent | `Incident` | No | Queue remediation proposal object for policy evaluation. |
| `Action::"approve_remediation"` | `MEDIUM`| Analyst (Med), Admin (High) | `ResponseAction` | **YES** | Authorize queued remediation proposal. |
| `Action::"execute_remediation"` | `MED/HIGH`| Analyst (Med), Admin (High) | `ResponseAction` | **YES** | Trigger mock execution of remediation action. |
| `Action::"modify_security_rule"`| `HIGH` | Admin (MFA Required) | `SecurityRule` | **YES** | Update rule detection threshold or activate/deactivate rule. |
| `Action::"delete_audit_log"` | `CRITICAL`| **FORBIDDEN FOR ALL** | `AuditLog` | N/A | **Globally Denied.** System logs are append-only. |

---

## 5. Authorization Context Schema

Every Cedar authorization request must supply a validated context object conforming to [`contracts/authorization/authorization-context.schema.json`](file:///d:/CODE/Projects/Sentinal%20Flow/SentinelFlow/contracts/authorization/authorization-context.schema.json):

```json
{
  "approved_by_analyst": true,
  "approved_by_admin": false,
  "approval_timestamp": "2026-03-12T09:48:10.000Z",
  "request_source": "analyst_ui",
  "mfa_authenticated": false,
  "risk_level": "medium",
  "target_matches_incident": true,
  "incident_id": "INC-0001"
}
```

### Context Field Definitions
- `approved_by_analyst`: Boolean verified from signed analyst session token.
- `approved_by_admin`: Boolean verified from signed administrator session token.
- `approval_timestamp`: ISO-8601 UTC timestamp of approval.
- `request_source`: Verified caller identity established by AWS Cognito JWT / IAM.
- `mfa_authenticated`: Boolean indicating hardware/TOTP MFA verification.
- `risk_level`: Evaluated action tier (`low`, `medium`, `high`).
- `target_matches_incident`: Boolean indicating target entity is present in incident entity set.

---

## 6. Cedar Policy Architecture

The complete Cedar policy set is maintained in [`contracts/authorization/policies.cedar`](file:///d:/CODE/Projects/Sentinal%20Flow/SentinelFlow/contracts/authorization/policies.cedar).

### Key Policy Rules Summary

1. **Analyst Read & Remediation (`policy01` - `policy03`):**
   - Permits `SecurityAnalyst` to read incidents and assets.
   - Permits approving and executing remediations *only when* `risk_level in ["low", "medium"]` and `target_matches_incident == true`.
2. **AI Agent Sandboxing (`policy04` - `policy06`):**
   - Permits `Service::"ai_agent"` to read evidence and propose investigations.
   - **Explicit FORBID** on `execute_remediation`, `approve_remediation`, `modify_security_rule`, `view_audit_log`, and `delete_audit_log`.
3. **Security Admin Elevated Privileges (`policy07` - `policy09`):**
   - Permits approving and executing high-risk remediations when `approved_by_admin == true`, `target_matches_incident == true`, and `mfa_authenticated == true`.
   - Permits modifying security rules when `mfa_authenticated == true`.
4. **Audit Immutability (`policy11`):**
   - Unconditional `forbid` on `Action::"delete_audit_log"` for all principals.
5. **Target Entity Validation (`policy12`):**
   - Unconditional `forbid` on remediation if `target_matches_incident == false`.

---

## 7. Cross-Member Integration Guidelines

### Member 1 (AI Agent Lead — `ai-agent/`)
- When invoking tools or outputting proposals, target ONLY `Action::"create_investigation"` or `Action::"propose_remediation"`.
- Never generate direct execution instructions; all proposals are routed to Cedar.

### Member 2 (AWS/Backend Lead — `backend/`)
- Integrate [`contracts/authorization/authorizer.py`](file:///d:/CODE/Projects/Sentinal%20Flow/SentinelFlow/contracts/authorization/authorizer.py) at the API Gateway / Lambda invocation boundary.
- Construct the `context` dictionary strictly from server-side verified session claims and database state.
- Ensure the DynamoDB audit logger captures the returned `audit_record`.

### Member 3 (Frontend Lead — `frontend/`)
- Render remediation action buttons with visual risk indicators:
  - **Medium Risk (Orange):** Requires single Analyst confirmation click.
  - **High Risk (Red):** Requires Admin MFA prompt & confirmation.
- Render UI disabled states when Cedar evaluation indicates `DENY`.
