import React from 'react';
import { ShieldAlert, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import type { AIAnalysisResult } from '../../services/aiAnalystService';
import { Link } from 'react-router-dom';

interface EvidenceListProps {
  evidence: AIAnalysisResult['evidence'];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <X size={16} color="var(--color-critical)" />;
      case 'high': return <ShieldAlert size={16} color="var(--color-high)" />;
      case 'medium': return <AlertTriangle size={16} color="var(--color-medium)" />;
      case 'low':
      default: return <Check size={16} color="var(--color-success)" />;
    }
  };

  return (
    <div style={{ marginTop: 'var(--space-6)' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        Corroborating Evidence
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-2)'
      }}>
        {evidence.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '2px' }}>{getIcon(item.severity)}</div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {item.description}
                </div>
                {item.metadata && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px', fontFamily: item.metadata.includes('192.') ? 'var(--font-family-mono)' : 'inherit' }}>
                    {item.metadata}
                  </div>
                )}
              </div>
            </div>
            
            <Link 
              to={item.type === 'event' ? '/events' : '#'}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-1)',
                fontSize: '0.75rem',
                color: 'var(--color-action)',
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-action-bg)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              {item.type === 'event' ? 'View Event' : 'View Device'}
              <ExternalLink size={12} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
