import React from 'react';
import { Bot, Check, Info, ShieldAlert } from 'lucide-react';

export const AIAnalystPanel: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div style={{ backgroundColor: 'var(--color-action-bg)', color: 'var(--color-action)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
          <Bot size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Sentinel AI Analyst</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-action)' }}>Investigation Complete • High Confidence</span>
        </div>
      </div>

      {/* Query Block */}
      <div style={{ 
        backgroundColor: 'var(--bg-tertiary)', 
        borderLeft: '3px solid var(--border-strong)',
        padding: 'var(--space-3)', 
        marginBottom: 'var(--space-4)',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Analyst Query</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Why is this incident classified as high risk?</div>
      </div>

      {/* AI Response Block */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <p style={{ marginBottom: 'var(--space-4)' }}>
          This incident exhibits a classic <strong>Brute Force to Privilege Escalation</strong> pattern. The attacker successfully gained entry after multiple failed attempts, immediately changed their role, and accessed a highly sensitive data resource.
        </p>

        <div style={{ 
          backgroundColor: 'var(--bg-primary)', 
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)', 
          padding: 'var(--space-4)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Corroborating Evidence
          </div>
          
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
              <Check size={14} color="var(--color-success)" />
              <span>27 failed logins from <span style={{ fontFamily: 'var(--font-family-mono)' }}>192.168.1.45</span></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
              <Check size={14} color="var(--color-success)" />
              <span>Successful login directly following failures</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
              <Check size={14} color="var(--color-success)" />
              <span>Unrecognized device signature</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-high)' }}>
              <ShieldAlert size={14} />
              <span>Privilege escalation to 'SuperAdmin'</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-high)' }}>
              <ShieldAlert size={14} />
              <span>Immediate access to 'Customer DB' post-escalation</span>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ 
        marginTop: 'var(--space-4)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-2)', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)' 
      }}>
        <Info size={14} />
        AI-generated analysis based on real-time event correlation. Always verify with raw logs.
      </div>
    </div>
  );
};
