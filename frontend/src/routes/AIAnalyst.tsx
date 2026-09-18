import React from 'react';
import { AIAnalystPanel } from '../components/ai/AIAnalystPanel';

export const AIAnalyst: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Global AI Analyst</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Chat with the SentinelFlow AI about any system activity.</p>
      </header>
      
      <div style={{ flex: 1, maxWidth: '800px' }}>
        <AIAnalystPanel />
      </div>
    </div>
  );
};
