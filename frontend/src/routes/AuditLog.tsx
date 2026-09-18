import React from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '../components/common/Button';

const mockAuditLogs = [
  { id: 'AL-9005', timestamp: '11:44:12 AM', actor: 'System', action: 'Session revoked', auth: '-', result: 'SUCCESS' },
  { id: 'AL-9004', timestamp: '11:44:10 AM', actor: 'Admin (j.smith)', action: 'Approved session revocation', auth: 'Cedar Authorized', result: 'APPROVED' },
  { id: 'AL-9003', timestamp: '11:42:05 AM', actor: 'AI Agent', action: 'Recommended session revocation', auth: 'Pending Approval', result: 'LOGGED' },
  { id: 'AL-9002', timestamp: '10:15:22 AM', actor: 'Admin (m.jones)', action: 'Updated firewall rule block-list', auth: 'Cedar Authorized', result: 'SUCCESS' },
  { id: 'AL-9001', timestamp: '09:05:01 AM', actor: 'System', action: 'Automated daily backup', auth: 'System Role', result: 'SUCCESS' },
];

export const AuditLog: React.FC = () => {
  const getResultBadge = (result: string) => {
    let color = 'var(--text-secondary)';
    let border = 'var(--border-strong)';
    
    switch (result) {
      case 'SUCCESS':
      case 'APPROVED':
        color = 'var(--color-success)';
        border = 'var(--color-success)';
        break;
      case 'LOGGED':
        color = 'var(--text-secondary)';
        break;
      case 'FAILED':
      case 'DENIED':
        color = 'var(--color-critical)';
        border = 'var(--color-critical)';
        break;
    }

    return (
      <span style={{ 
        color, 
        border: `1px solid ${border}`, 
        padding: '2px 8px', 
        borderRadius: 'var(--radius-sm)', 
        fontSize: '0.75rem', 
        fontWeight: 500 
      }}>
        {result}
      </span>
    );
  };

  const getActorBadge = (actor: string) => {
    if (actor.includes('AI Agent')) {
      return <span style={{ color: 'var(--color-action)', fontWeight: 500 }}>{actor}</span>;
    }
    if (actor.includes('System')) {
      return <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{actor}</span>;
    }
    return <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{actor}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Audit Log</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Immutable record of all system and user actions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Filter size={16} /> Filter
          </Button>
          <Button variant="primary" style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Download size={16} /> Export
          </Button>
        </div>
      </header>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        flex: 1
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Actor</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Authorization</th>
              <th style={thStyle}>Result</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map(log => (
              <tr 
                key={log.id} 
                style={{ 
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{...tdStyle, fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem'}}>{log.timestamp}</td>
                <td style={tdStyle}>{getActorBadge(log.actor)}</td>
                <td style={{...tdStyle, color: 'var(--text-primary)'}}>{log.action}</td>
                <td style={{...tdStyle, fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{log.auth}</td>
                <td style={tdStyle}>{getResultBadge(log.result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
