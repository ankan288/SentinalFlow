import React from 'react';
import type { SecurityEvent, EventSeverity, EventStatus } from '../../services/eventsService';

interface EventTableProps {
  events: SecurityEvent[];
  onEventClick: (event: SecurityEvent) => void;
  isLoading: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({ events, onEventClick, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
        Loading security events...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>No security events match your current filters.</p>
      </div>
    );
  }

  const getSeverityStyle = (severity: EventSeverity) => {
    switch (severity) {
      case 'CRITICAL': return { color: 'var(--color-critical)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-critical)' };
      case 'HIGH': return { color: 'var(--color-high)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--color-high)' };
      case 'MEDIUM': return { color: 'var(--color-medium)', backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid var(--color-medium)' };
      case 'LOW': return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)' };
      case 'INFO': return { color: 'var(--color-info)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--color-info)' };
    }
  };

  const getStatusStyle = (status: EventStatus) => {
    switch (status) {
      case 'CORRELATED': return { color: 'var(--color-critical)' };
      case 'SUSPICIOUS': return { color: 'var(--color-high)' };
      case 'OBSERVED': return { color: 'var(--text-muted)' };
    }
  };

  return (
    <div style={{ 
      overflowX: 'auto',
      backgroundColor: 'rgba(8, 13, 23, 0.55)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.28)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)', backgroundColor: 'rgba(20, 27, 42, 0.45)' }}>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Time</th>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Event</th>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Source</th>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>User</th>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Resource</th>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Severity</th>
            <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr 
              key={event.id}
              onClick={() => onEventClick(event)}
              style={{ 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{event.timestamp}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-primary)', fontWeight: 500 }}>
                {event.description}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.id}</div>
              </td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontFamily: 'var(--font-family-mono)' }}>{event.source}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)' }}>{event.user}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)' }}>{event.resource}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <span style={{ 
                  ...getSeverityStyle(event.severity),
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {event.severity}
                </span>
              </td>
              <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <span style={{ 
                  ...getStatusStyle(event.status),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}>
                  {event.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
