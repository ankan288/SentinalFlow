import React, { useState, useRef, useEffect } from 'react';
import { Download, Filter, Check } from 'lucide-react';
import { Button } from '../components/common/Button';

const mockAuditLogs = [
  { id: 'AL-9005', timestamp: '11:44:12 AM', actor: 'System', action: 'Session revoked', auth: '-', result: 'SUCCESS' },
  { id: 'AL-9004', timestamp: '11:44:10 AM', actor: 'Admin (j.smith)', action: 'Approved session revocation', auth: 'Cedar Authorized', result: 'APPROVED' },
  { id: 'AL-9003', timestamp: '11:42:05 AM', actor: 'AI Agent', action: 'Recommended session revocation', auth: 'Pending Approval', result: 'LOGGED' },
  { id: 'AL-9002', timestamp: '10:15:22 AM', actor: 'Admin (m.jones)', action: 'Updated firewall rule block-list', auth: 'Cedar Authorized', result: 'SUCCESS' },
  { id: 'AL-9001', timestamp: '09:05:01 AM', actor: 'System', action: 'Automated daily backup', auth: 'System Role', result: 'SUCCESS' },
  { id: 'AL-9000', timestamp: '08:12:44 AM', actor: 'External IP', action: 'Failed login attempt', auth: 'Invalid Credentials', result: 'FAILED' },
];

export const AuditLog: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Authorization', 'Result'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => `"${log.timestamp}","${log.actor}","${log.action}","${log.auth}","${log.result}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${filterType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const filteredLogs = mockAuditLogs.filter(log => {
    if (filterType === 'ALL') return true;
    if (filterType === 'SUCCESS') return log.result === 'SUCCESS' || log.result === 'APPROVED';
    if (filterType === 'WARNINGS') return log.result === 'LOGGED' || log.result === 'FAILED' || log.result === 'DENIED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)', color: '#ffffff' }}>Audit Log</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Immutable record of all system and user actions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <Button 
              variant={filterType !== 'ALL' ? 'primary' : 'secondary'} 
              style={{ display: 'flex', gap: 'var(--space-2)' }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} /> {filterType === 'ALL' ? 'Filter' : `Filtered (${filteredLogs.length})`}
            </Button>
            
            {isFilterOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '200px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '8px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)', zIndex: 50 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', padding: '4px 8px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter by Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['ALL', 'SUCCESS', 'WARNINGS'].map(type => (
                    <button 
                      key={type}
                      onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        textAlign: 'left', padding: '8px', fontSize: '13px', 
                        backgroundColor: filterType === type ? 'var(--bg-tertiary)' : 'transparent', 
                        border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' 
                      }}
                    >
                      {type === 'ALL' ? 'All Logs' : type === 'SUCCESS' ? 'Success & Approved' : 'Failed & Logged'}
                      {filterType === type && <Check size={14} color="var(--color-success)" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button variant="primary" style={{ display: 'flex', gap: 'var(--space-2)' }} onClick={handleExport}>
            <Download size={16} /> Export
          </Button>
        </div>
      </header>

      <div style={{
        backgroundColor: 'rgba(10, 15, 25, 0.55)',
        backdropFilter: 'blur(18px) saturate(120%)',
        WebkitBackdropFilter: 'blur(18px) saturate(120%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        flex: 1
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(20, 27, 42, 0.45)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Actor</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Authorization</th>
              <th style={thStyle}>Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? filteredLogs.map(log => (
              <tr 
                key={log.id} 
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{...tdStyle, fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem'}}>{log.timestamp}</td>
                <td style={tdStyle}>{getActorBadge(log.actor)}</td>
                <td style={{...tdStyle, color: 'var(--text-primary)'}}>{log.action}</td>
                <td style={{...tdStyle, fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{log.auth}</td>
                <td style={tdStyle}>{getResultBadge(log.result)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No logs match the selected filter.
                </td>
              </tr>
            )}
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
