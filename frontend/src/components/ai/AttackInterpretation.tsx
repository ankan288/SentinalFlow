import React from 'react';
import { ArrowDown } from 'lucide-react';
import type { AIAnalysisResult } from '../../services/aiAnalystService';

interface AttackInterpretationProps {
  attackChain: AIAnalysisResult['attackChain'];
}

export const AttackInterpretation: React.FC<AttackInterpretationProps> = ({ attackChain }) => {
  const nodes = [
    { label: 'Attacker / IP', value: attackChain.ip, mono: true },
    { label: 'User', value: attackChain.user, mono: false },
    { label: 'Device', value: attackChain.device, mono: false },
    { label: 'Privilege', value: attackChain.privilege, mono: false, highlight: true },
    { label: 'Sensitive Resource', value: attackChain.resource, mono: false, danger: true }
  ];

  return (
    <div style={{ marginTop: 'var(--space-6)' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        Attack Interpretation
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-2)',
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-medium)'
      }}>
        {nodes.map((node, index) => (
          <React.Fragment key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{node.label}</span>
              <span style={{ 
                color: node.danger ? 'var(--color-critical)' : node.highlight ? 'var(--color-high)' : 'var(--text-primary)',
                fontFamily: node.mono ? 'var(--font-family-mono)' : 'inherit',
                fontSize: node.mono ? '0.8125rem' : '0.875rem',
                fontWeight: (node.highlight || node.danger) ? 600 : 400
              }}>
                {node.value}
              </span>
            </div>
            {index < nodes.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 'var(--space-4)' }}>
                <ArrowDown size={14} color="var(--text-muted)" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
