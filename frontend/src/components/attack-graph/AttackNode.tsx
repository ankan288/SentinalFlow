import React from 'react';
import { Globe, User, MonitorSmartphone, Shield, Database } from 'lucide-react';

export interface AttackNodeData {
  id: string;
  type: 'IP' | 'User' | 'Device' | 'Privilege' | 'Resource';
  name: string;
  status: 'compromised' | 'suspicious' | 'targeted';
  eventCount: number;
}

interface AttackNodeProps {
  data: AttackNodeData;
  isSelected: boolean;
  onClick: (data: AttackNodeData) => void;
}

export const AttackNode: React.FC<AttackNodeProps> = ({ data, isSelected, onClick }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'IP': return <Globe size={20} />;
      case 'User': return <User size={20} />;
      case 'Device': return <MonitorSmartphone size={20} />;
      case 'Privilege': return <Shield size={20} />;
      case 'Resource': return <Database size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'compromised': return 'var(--color-critical)';
      case 'suspicious': return 'var(--color-high)';
      case 'targeted': return 'var(--color-medium)';
    }
  };

  return (
    <div 
      onClick={() => onClick(data)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-tertiary)',
        border: `2px solid ${isSelected ? getStatusColor() : 'var(--border-strong)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: getStatusColor(),
        position: 'relative',
        boxShadow: isSelected ? `0 0 15px ${getStatusColor()}40` : 'none'
      }}>
        {getIcon()}
        
        {data.eventCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: 'var(--color-action)',
            color: 'white',
            fontSize: '0.625rem',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '2px 6px',
            border: '2px solid var(--bg-secondary)'
          }}>
            {data.eventCount}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {data.type}
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {data.name}
        </div>
      </div>
    </div>
  );
};
