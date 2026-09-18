import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

export const IncidentHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isAssigned, setIsAssigned] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <button 
        onClick={() => navigate('/incidents')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 'var(--space-4)',
          fontSize: '0.875rem'
        }}
      >
        <ArrowLeft size={16} />
        Back to Incidents
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family-mono)' }}>INC-047</span>
            <span style={{ 
              backgroundColor: 'var(--color-high-bg)', 
              color: 'var(--color-high)', 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldAlert size={12} />
              HIGH RISK
            </span>
            <span style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              color: 'var(--text-primary)', 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.75rem', 
              fontWeight: 500 
            }}>
              Active
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)' }}>Credential Compromise</h1>
          <div style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontSize: '0.875rem' }}>
            Detected 10 minutes ago • Assigned to: Unassigned
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button 
            variant={isAssigned ? 'primary' : 'secondary'} 
            style={{ display: 'flex', gap: 'var(--space-2)' }}
            onClick={() => setIsAssigned(!isAssigned)}
          >
            <UserPlus size={16} /> {isAssigned ? 'Assigned to You' : 'Assign to Me'}
          </Button>
          <Button 
            variant={isAcknowledged ? 'primary' : 'secondary'} 
            style={{ display: 'flex', gap: 'var(--space-2)' }}
            onClick={() => setIsAcknowledged(!isAcknowledged)}
          >
            <CheckCircle size={16} /> {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
          </Button>
        </div>
      </div>
    </div>
  );
};
