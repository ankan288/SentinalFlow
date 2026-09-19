import React, { useEffect, useState } from 'react';
import { User, Laptop, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { incidentsService } from '../../services/incidentsService';
import type { Incident } from '../../services/incidentsService';

export const InvestigationContext: React.FC<{ incidentId?: string }> = ({ incidentId }) => {
  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    if (!incidentId) return;
    
    let isMounted = true;
    incidentsService.getIncidentById(incidentId)
      .then(res => {
        if (isMounted) setIncident(res);
      })
      .catch(console.error);
      
    return () => { isMounted = false; };
  }, [incidentId]);

  if (!incidentId || !incident) {
    return null; // Don't show context if not loaded
  }

  return (
    <div style={{
      backgroundColor: 'rgba(10, 15, 25, 0.58)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.22)',
      borderRadius: '14px',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        Investigation Context
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Link to={`/incidents/${incident.id}`} style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>Incident {incident.id}</Link>
            <span style={{ 
              backgroundColor: incident.severity === 'Critical' || incident.severity === 'High' ? 'var(--color-critical-bg)' : 'var(--color-medium-bg)', 
              color: incident.severity === 'Critical' || incident.severity === 'High' ? 'var(--color-critical)' : 'var(--color-medium)', 
              padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
            }}>{incident.severity.toUpperCase()}</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>{incident.type}</div>
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-medium)' }}></div>

        <div style={{ display: 'flex', gap: 'var(--space-6)', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <User size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{incident.user}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Network size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-mono)' }}>{incident.source}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Laptop size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Device</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>DEV-8821</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
