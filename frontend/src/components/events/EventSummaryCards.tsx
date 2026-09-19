import React from 'react';
import { Activity, ShieldAlert, Key, AlertTriangle } from 'lucide-react';

export const EventSummaryCards: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-6)'
    }}>
      <style>{`
        .glass-card {
          background-color: rgba(10, 15, 25, 0.50);
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          transition: all 0.2s ease;
        }
        .glass-card:hover {
          background-color: rgba(15, 20, 35, 0.60);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }
      `}</style>
      
      <div className="glass-card">
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
          <Activity size={20} color="var(--color-info)" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Events</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>2,847</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Last 24 hours</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
          <ShieldAlert size={20} color="var(--color-critical)" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Critical</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>12</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Requires attention</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
          <Key size={20} color="var(--color-medium)" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Failed Logins</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>486</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Authentication activity</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
          <AlertTriangle size={20} color="var(--color-high)" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suspicious</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>37</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Correlated signals</div>
        </div>
      </div>
    </div>
  );
};
