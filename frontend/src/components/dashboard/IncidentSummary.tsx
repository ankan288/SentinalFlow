import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockIncidents = [
  { id: 'INC-047', type: 'Credential Compromise', severity: 'High', status: 'Active', time: '10 mins ago' },
  { id: 'INC-046', type: 'Unusual Data Exfiltration', severity: 'Medium', status: 'Investigating', time: '2 hours ago' },
  { id: 'INC-045', type: 'Multiple Failed Logins', severity: 'Low', status: 'Resolved', time: '5 hours ago' }
];

export const IncidentSummary: React.FC = () => {
  const navigate = useNavigate();

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'High': return 'var(--color-high)';
      case 'Medium': return 'var(--color-medium)';
      default: return 'var(--color-low)';
    }
  };

  return (
    <div style={{
      backgroundColor: 'rgba(8, 13, 23, 0.55)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.26)',
      borderRadius: '16px',
      padding: 'var(--space-4)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <AlertTriangle size={18} color="var(--color-medium)" />
          Recent Incidents
        </h3>
        <button 
          onClick={() => navigate('/incidents')}
          style={{ 
            background: 'none', border: 'none', color: 'var(--color-action)', 
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 
          }}
        >
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
        {mockIncidents.map(incident => (
          <div 
            key={incident.id}
            onClick={() => navigate(`/incidents/${incident.id}`)}
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(255, 255, 255, 0.015)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${getSeverityColor(incident.severity)}`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.015)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{incident.type}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{incident.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{incident.id}</span>
              <span style={{ 
                color: incident.status === 'Active' ? 'var(--color-critical)' : 'var(--text-secondary)',
                fontWeight: 500
              }}>
                {incident.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
