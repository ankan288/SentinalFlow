// Allow AI Agents to investigate and create recommendations
permit (
    principal in SentinelFlow::Role::"Agent",
    action in [
        SentinelFlow::Action::"Investigate", 
        SentinelFlow::Action::"SearchLogs", 
        SentinelFlow::Action::"CreateRecommendation"
    ],
    resource
);

// Explicitly deny AI Agents from executing destructive actions
forbid (
    principal in SentinelFlow::Role::"Agent",
    action in [
        SentinelFlow::Action::"DeleteData", 
        SentinelFlow::Action::"DisableInfrastructure", 
        SentinelFlow::Action::"ExecuteAction"
    ],
    resource
);

// Allow Human Admins to execute any action
permit (
    principal in SentinelFlow::Role::"Admin",
    action,
    resource
);

// Allow Human Analysts to execute non-destructive mitigation actions on Incidents
permit (
    principal in SentinelFlow::Role::"Analyst",
    action in [
        SentinelFlow::Action::"BlockIP", 
        SentinelFlow::Action::"IsolateHost", 
        SentinelFlow::Action::"ExecuteAction"
    ],
    resource == SentinelFlow::Resource::"Incident"
);
