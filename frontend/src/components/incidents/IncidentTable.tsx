import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsService } from '../../services/incidentsService';
import type { Incident } from '../../services/incidentsService';

interface IncidentTableProps {
  incidents?: Incident[];
  loading?: boolean;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents: propIncidents, loading: propLoading }) => {
  const navigate = useNavigate();
  const [internalIncidents, setInternalIncidents] = useState<Incident[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    if (propIncidents !== undefined) return;
    
    let isMounted = true;
    const fetchIncidents = async () => {
      try {
        setInternalLoading(true);
        const data = await incidentsService.getIncidents();
        if (isMounted) setInternalIncidents(data.incidents);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
      } finally {
        if (isMounted) setInternalLoading(false);
      }
    };
    fetchIncidents();
    
    return () => { isMounted = false; };
  }, [propIncidents]);

  const incidents = propIncidents !== undefined ? propIncidents : internalIncidents;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

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
      backgroundColor: 'rgba(8, 13, 23, 0.55)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.28)',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {loading && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading incidents...
        </div>
      )}
      
      {!loading && incidents.length === 0 && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No incidents found.
        </div>
      )}

      {!loading && incidents.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(20, 27, 42, 0.42)', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
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
            {incidents.map(incident => (
              <tr 
                key={incident.id} 
                onClick={() => navigate(`/incidents/${incident.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/incidents/${incident.id}`);
                  }
                }}
                tabIndex={0}
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{...tdStyle, fontWeight: 600, color: 'var(--text-primary)'}}>{incident.id}</td>
                <td style={tdStyle}>{incident.type}</td>
                <td style={tdStyle}>{getSeverityBadge(incident.severity)}</td>
                <td style={tdStyle}>{incident.user}</td>
                <td style={{...tdStyle, fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem'}}>{incident.source}</td>
                <td style={{...tdStyle, color: 'var(--text-secondary)'}}>{new Date(incident.detected).toLocaleString()}</td>
                <td style={tdStyle}>{getStatusBadge(incident.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
