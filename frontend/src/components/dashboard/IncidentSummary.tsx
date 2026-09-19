import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { incidentsService } from '../../services/incidentsService';
import type { Incident } from '../../services/incidentsService';
import { useDemo } from '../../context/DemoContext';

export const IncidentSummary: React.FC<{ realData?: { incidents: Incident[], loading: boolean } }> = ({ realData }) => {
  const navigate = useNavigate();
  const { isDemoMode } = useDemo();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (realData) return; // Skip fetch if we have realData
    
    let isMounted = true;
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        // Only fetch a few for the summary
        const data = await incidentsService.getIncidents(3);
        if (isMounted) setIncidents(data.incidents.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch incidents for summary", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    if (isDemoMode) {
      fetchIncidents();
    } else {
      setLoading(false);
    }
    
    return () => { isMounted = false; };
  }, [isDemoMode, realData]);

  const displayIncidents = realData ? realData.incidents.slice(0, 5) : incidents;
  const isComponentLoading = realData ? realData.loading : loading;

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'var(--color-critical)';
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
      flexDirection: 'column',
      position: 'relative'
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

      {isComponentLoading ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', flex: 1 }}>
          Loading...
        </div>
      ) : displayIncidents.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', flex: 1 }}>
          <p style={{ margin: '0 0 var(--space-2) 0' }}>No active incidents</p>
          {realData && <p style={{ margin: 0, fontSize: '0.875rem' }}>Your environment is currently clear.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
          {displayIncidents.map(incident => (
            <div 
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(incident.detected).toLocaleDateString()}</span>
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
      )}
    </div>
  );
};
