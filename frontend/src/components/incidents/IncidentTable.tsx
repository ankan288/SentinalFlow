import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockIncidents = [
  { id: 'INC-047', type: 'Credential Compromise', severity: 'High', user: 'admin@acme.com', source: '192.168.1.45', detected: '10 mins ago', status: 'Active' },
  { id: 'INC-046', type: 'Unusual Data Exfiltration', severity: 'Medium', user: 'svc_reporting', source: '10.0.5.12', detected: '2 hours ago', status: 'Investigating' },
  { id: 'INC-045', type: 'Multiple Failed Logins', severity: 'Low', user: 'j.smith@acme.com', source: '203.0.113.42', detected: '5 hours ago', status: 'Resolved' },
  { id: 'INC-044', type: 'Privilege Escalation Attempt', severity: 'Critical', user: 'dev_user1', source: '10.0.8.22', detected: '1 day ago', status: 'Resolved' },
];

export const IncidentTable: React.FC = () => {
  const navigate = useNavigate();

  const getSeverityBadge = (severity: string) => {
    let color = '';
    let bg = '';
    switch(severity) {
      case 'Critical': color = 'var(--color-critical)'; bg = 'var(--color-critical-bg)'; break;
      case 'High': color = 'var(--color-high)'; bg = 'var(--color-high-bg)'; break;
      case 'Medium': color = 'var(--color-medium)'; bg = 'var(--color-medium-bg)'; break;
      case 'Low': color = 'var(--color-low)'; bg = 'var(--color-low-bg)'; break;
    }
    return (
      <span style={{ 
        color, backgroundColor: bg, padding: '2px 8px', borderRadius: 'var(--radius-full)', 
        fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' 
      }}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    let color = '';
    switch(status) {
      case 'Active': color = 'var(--color-critical)'; break;
      case 'Investigating': color = 'var(--color-medium)'; break;
      case 'Resolved': color = 'var(--color-success)'; break;
      default: color = 'var(--text-secondary)';
    }
    return (
      <span style={{ 
        color, border: `1px solid ${color}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', 
        fontSize: '0.75rem', fontWeight: 500, display: 'inline-block' 
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
          <tr>
            <th style={thStyle}>Incident ID</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Severity</th>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Detected</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockIncidents.map(incident => (
            <tr 
              key={incident.id} 
              onClick={() => navigate(`/incidents/${incident.id}`)}
              style={{ 
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{...tdStyle, fontWeight: 600, color: 'var(--text-primary)'}}>{incident.id}</td>
              <td style={tdStyle}>{incident.type}</td>
              <td style={tdStyle}>{getSeverityBadge(incident.severity)}</td>
              <td style={tdStyle}>{incident.user}</td>
              <td style={{...tdStyle, fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem'}}>{incident.source}</td>
              <td style={{...tdStyle, color: 'var(--text-secondary)'}}>{incident.detected}</td>
              <td style={tdStyle}>{getStatusBadge(incident.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)'
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  fontSize: '0.875rem',
  color: 'var(--text-secondary)'
};
