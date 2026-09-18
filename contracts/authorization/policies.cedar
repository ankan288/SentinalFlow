// ==============================================================================
// SentinelFlow — AWS Cedar Authorization Policy Set
// 
// Defines the enforceable security boundary at Trust Boundary TB-5.
// Implements Default Deny, Role-Based Access Control, Human-in-the-Loop gates,
// strict AI Agent sandboxing, and immutable append-only audit protection.
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. ANALYST POLICIES
// ------------------------------------------------------------------------------

// Policy 0: Analysts can read incidents, events, evidence, and assets
@id("policy01_analyst_read")
permit (
    principal in SentinelFlow::Role::"SecurityAnalyst",
    action in [
        SentinelFlow::Action::"read_incident",
        SentinelFlow::Action::"read_event",
        SentinelFlow::Action::"read_evidence",
        SentinelFlow::Action::"read_asset"
    ],
    resource
);

// Policy 1: Analysts can approve low and medium risk remediations if target matches incident
@id("policy02_analyst_approve_remediation")
permit (
    principal in SentinelFlow::Role::"SecurityAnalyst",
    action == SentinelFlow::Action::"approve_remediation",
    resource
)
when {
    (context.risk_level == "low" || context.risk_level == "medium") &&
    context.target_matches_incident == true
};

// Policy 2: Analysts can execute low and medium risk remediations when analyst approval is present
@id("policy03_analyst_execute_remediation")
permit (
    principal in SentinelFlow::Role::"SecurityAnalyst",
    action == SentinelFlow::Action::"execute_remediation",
    resource
)
when {
    (context.risk_level == "low" || context.risk_level == "medium") &&
    context.approved_by_analyst == true &&
    context.target_matches_incident == true
};

// ------------------------------------------------------------------------------
// 2. AI INVESTIGATOR AGENT POLICIES (TB-4 -> TB-5)
// ------------------------------------------------------------------------------

// Policy 3: AI Agent can read incidents, evidence, and assets to conduct investigations
@id("policy04_ai_read_evidence")
permit (
    principal == SentinelFlow::Service::"ai_agent",
    action in [
        SentinelFlow::Action::"read_incident",
        SentinelFlow::Action::"read_evidence",
        SentinelFlow::Action::"read_asset"
    ],
    resource
);

// Policy 4: AI Agent can generate structured investigations and propose remediations
@id("policy05_ai_propose_investigation")
permit (
    principal == SentinelFlow::Service::"ai_agent",
    action in [
        SentinelFlow::Action::"create_investigation",
        SentinelFlow::Action::"propose_remediation"
    ],
    resource
);

// Policy 5: Strict AI Sandboxing — AI Agent is explicitly FORBIDDEN from execution and admin
@id("policy06_ai_forbid_execution_and_admin")
forbid (
    principal == SentinelFlow::Service::"ai_agent",
    action in [
        SentinelFlow::Action::"execute_remediation",
        SentinelFlow::Action::"approve_remediation",
        SentinelFlow::Action::"modify_security_rule",
        SentinelFlow::Action::"view_audit_log",
        SentinelFlow::Action::"delete_audit_log"
    ],
    resource
);

// ------------------------------------------------------------------------------
// 3. SECURITY ADMIN POLICIES
// ------------------------------------------------------------------------------

// Policy 6: Security Admins have broad read and approval privileges
@id("policy07_admin_read_and_approve")
permit (
    principal in SentinelFlow::Role::"SecurityAdmin",
    action in [
        SentinelFlow::Action::"read_incident",
        SentinelFlow::Action::"read_event",
        SentinelFlow::Action::"read_evidence",
        SentinelFlow::Action::"read_asset",
        SentinelFlow::Action::"view_audit_log",
        SentinelFlow::Action::"approve_remediation"
    ],
    resource
);

// Policy 7: Security Admins can execute high-risk remediations with MFA and approval
@id("policy08_admin_execute_remediation")
permit (
    principal in SentinelFlow::Role::"SecurityAdmin",
    action == SentinelFlow::Action::"execute_remediation",
    resource
)
when {
    context.approved_by_admin == true &&
    context.target_matches_incident == true &&
    context.mfa_authenticated == true
};

// Policy 8: Security Admins can modify detection/security rules with MFA
@id("policy09_admin_modify_security_rule")
permit (
    principal in SentinelFlow::Role::"SecurityAdmin",
    action == SentinelFlow::Action::"modify_security_rule",
    resource
)
when {
    context.mfa_authenticated == true
};

// ------------------------------------------------------------------------------
// 4. AUDITOR POLICIES
// ------------------------------------------------------------------------------

// Policy 9: Auditors can inspect audit logs, incidents, and evidence
@id("policy10_auditor_read")
permit (
    principal in SentinelFlow::Role::"Auditor",
    action in [
        SentinelFlow::Action::"view_audit_log",
        SentinelFlow::Action::"read_incident",
        SentinelFlow::Action::"read_evidence"
    ],
    resource
);

// ------------------------------------------------------------------------------
// 5. GLOBAL SAFETY & INTEGRITY INVARIANTS (EXPLICIT FORBID)
// ------------------------------------------------------------------------------

// Policy 10: Invariant — Audit logs are immutable; deletion is strictly FORBIDDEN for everyone
@id("policy11_forbid_audit_log_deletion")
forbid (
    principal,
    action == SentinelFlow::Action::"delete_audit_log",
    resource
);

// Policy 11: Invariant — Forbid remediation approval or execution if target entity does not match incident
@id("policy12_forbid_target_mismatch")
forbid (
    principal,
    action in [
        SentinelFlow::Action::"approve_remediation",
        SentinelFlow::Action::"execute_remediation"
    ],
    resource
)
when {
    context.target_matches_incident == false
};
