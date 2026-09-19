import React from 'react';
import { User, Laptop, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InvestigationContext: React.FC = () => {
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
            <Link to="/incidents/INC-047" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>Incident #047</Link>
            <span style={{ 
              backgroundColor: 'var(--color-high-bg)', color: 'var(--color-high)', 
              padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
            }}>HIGH RISK</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>Credential Compromise</div>
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-medium)' }}></div>

        <div style={{ display: 'flex', gap: 'var(--space-6)', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <User size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>john.doe</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Network size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-mono)' }}>192.168.1.45</div>
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
