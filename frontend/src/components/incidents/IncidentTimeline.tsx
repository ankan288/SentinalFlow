import React from 'react';

export const IncidentTimeline: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '1.125rem', margin: 0, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Timeline</h3>
      
      <div style={{ position: 'relative', paddingLeft: 'var(--space-4)', flex: 1 }}>
        {/* Timeline Line */}
        <div style={{ 
          position: 'absolute', 
          left: '7px', 
          top: '10px', 
          bottom: '10px', 
          width: '2px', 
          backgroundColor: 'var(--border-strong)' 
        }} />

        <TimelineItem time="10:32 AM" title="Brute Force Attempt" desc="27 failed logins on admin account from 192.168.1.45" type="critical" />
        <TimelineItem time="10:34 AM" title="Account Compromise" desc="Successful login after failures" type="critical" />
        <TimelineItem time="10:36 AM" title="Privilege Escalation" desc="Role updated to SuperAdmin" type="high" />
        <TimelineItem time="10:38 AM" title="Data Access" desc="Query executed against Customer DB" type="high" />
        <TimelineItem time="10:40 AM" title="Incident Detected" desc="SentinelFlow AI raised incident INC-047" type="info" />
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{ time: string, title: string, desc: string, type: 'critical' | 'high' | 'medium' | 'info' }> = ({ time, title, desc, type }) => {
  let color = 'var(--text-secondary)';
  if (type === 'critical') color = 'var(--color-critical)';
  if (type === 'high') color = 'var(--color-high)';
  if (type === 'medium') color = 'var(--color-medium)';
  if (type === 'info') color = 'var(--color-action)';

  return (
    <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
      {/* Node */}
      <div style={{ 
        position: 'absolute', 
        left: 'calc(-1 * var(--space-4) - 4px)', 
        top: '4px', 
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        backgroundColor: 'var(--bg-secondary)',
        border: `2px solid ${color}`,
        zIndex: 1
      }} />
      
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
        {time}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {desc}
      </div>
    </div>
  );
};
