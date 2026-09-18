import React from 'react';
import { Database, Lock, LogIn, MonitorSmartphone, Server } from 'lucide-react';

export const EvidencePanel: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '1.125rem', margin: 0, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Evidence</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        
        <div style={evidenceItemStyle}>
          <div style={iconContainerStyle('var(--color-critical)')}><Lock size={16} /></div>
          <div>
            <div style={evidenceTitleStyle}>27 failed logins</div>
            <div style={evidenceDescStyle}>User: admin@acme.com • 10:32 AM - 10:34 AM</div>
          </div>
        </div>

        <div style={evidenceItemStyle}>
          <div style={iconContainerStyle('var(--color-success)')}><LogIn size={16} /></div>
          <div>
            <div style={evidenceTitleStyle}>Successful login</div>
            <div style={evidenceDescStyle}>10:34:12 AM</div>
          </div>
        </div>

        <div style={evidenceItemStyle}>
          <div style={iconContainerStyle('var(--color-high)')}><MonitorSmartphone size={16} /></div>
          <div>
            <div style={evidenceTitleStyle}>New device detected</div>
            <div style={evidenceDescStyle}>IP: 192.168.1.45 (Unknown Location)</div>
          </div>
        </div>

        <div style={evidenceItemStyle}>
          <div style={iconContainerStyle('var(--color-high)')}><Server size={16} /></div>
          <div>
            <div style={evidenceTitleStyle}>Privilege escalation</div>
            <div style={evidenceDescStyle}>Role changed to 'SuperAdmin' • 10:36 AM</div>
          </div>
        </div>

        <div style={evidenceItemStyle}>
          <div style={iconContainerStyle('var(--color-critical)')}><Database size={16} /></div>
          <div>
            <div style={evidenceTitleStyle}>Sensitive resource access</div>
            <div style={evidenceDescStyle}>Accessed Customer DB • 10:38 AM</div>
          </div>
        </div>

      </div>
    </div>
  );
};

const evidenceItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-3)',
  padding: 'var(--space-3)',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-light)'
};

const iconContainerStyle = (color: string): React.CSSProperties => ({
  color: color,
  backgroundColor: 'var(--bg-secondary)',
  padding: 'var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '2px'
});

const evidenceTitleStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '2px'
};

const evidenceDescStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)'
};
