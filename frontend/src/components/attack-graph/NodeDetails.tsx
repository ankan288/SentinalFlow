import React from 'react';
import type { AttackNodeData } from './AttackNode';

interface NodeDetailsProps {
  data: AttackNodeData;
  onClose: () => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ data, onClose }) => {
  return (
    <div style={{
      backgroundColor: 'rgba(10, 15, 25, 0.55)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.28)',
      borderRadius: '12px',
      padding: 'var(--space-4)',
      marginTop: 'var(--space-6)',
      position: 'relative',
      animation: 'slideUpFade 0.2s ease-out'
    }}>
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          right: 'var(--space-2)',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '1.25rem',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        &times;
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{data.type}</span>
        <span style={{ 
          fontSize: '0.625rem', 
          backgroundColor: data.status === 'compromised' ? 'var(--color-critical-bg)' : 'var(--color-medium-bg)',
          color: data.status === 'compromised' ? 'var(--color-critical)' : 'var(--color-medium)',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600
        }}>
          {data.status.toUpperCase()}
        </span>
      </div>
      
      <h4 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
        {data.name}
      </h4>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <p style={{ margin: '0 0 var(--space-2) 0' }}>
          <strong>Related Events:</strong> {data.eventCount}
        </p>
        <p style={{ margin: 0 }}>
          This node was identified as part of the attack chain. Review the timeline for specific interactions.
        </p>
      </div>
    </div>
  );
};
