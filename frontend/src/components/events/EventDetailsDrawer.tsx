import React from 'react';
import { X, ExternalLink, Bot, Network } from 'lucide-react';
import type { SecurityEvent } from '../../services/eventsService';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface EventDetailsDrawerProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

export const EventDetailsDrawer: React.FC<EventDetailsDrawerProps> = ({ event, onClose }) => {
  const navigate = useNavigate();

  if (!event) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 900,
          backdropFilter: 'blur(2px)'
        }}
        onClick={onClose}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-strong)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <div style={{ 
          padding: 'var(--space-4) var(--space-6)', 
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Event Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 'var(--space-6)', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{event.id}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{event.description}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.timestamp}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 'var(--space-2)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Type</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{event.type}</div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Source IP</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-mono)' }}>{event.source}</div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>User</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{event.user}</div>

              {event.device && (
                <>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Device</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{event.device}</div>
                </>
              )}

              {event.previousRole && event.newRole && (
                <>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Role Change</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-critical)', fontWeight: 600 }}>{event.previousRole} → {event.newRole}</div>
                </>
              )}

              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Resource</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{event.resource}</div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Severity</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: event.severity === 'CRITICAL' ? 'var(--color-critical)' : event.severity === 'HIGH' ? 'var(--color-high)' : 'var(--text-primary)' }}>{event.severity}</div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: event.status === 'CORRELATED' ? 'var(--color-critical)' : 'var(--text-secondary)' }}>{event.status}</div>
            </div>
          </div>

          {event.relatedIncidentId && (
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-medium)' 
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Related Incident</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{event.relatedIncidentId}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.relatedIncidentName}</div>
                </div>
                <Button variant="secondary" onClick={() => navigate(`/incidents/${event.relatedIncidentId?.replace('INC-', '')}`)}>
                  View Incident <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </Button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Investigation Tools</div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => navigate('/attack-graph')}>
                <Network size={16} /> Attack Graph
              </Button>
              <Button variant="primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => navigate('/ai-analyst')}>
                <Bot size={16} /> AI Analyst
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
