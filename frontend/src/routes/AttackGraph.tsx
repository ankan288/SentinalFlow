import React from 'react';
import { AttackGraphCanvas } from '../components/attack-graph/AttackGraphCanvas';

export const AttackGraph: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Attack Graph Analysis</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize the entire kill chain across all entities.</p>
      </header>
      
      <div style={{ flex: 1 }}>
        <AttackGraphCanvas />
      </div>
    </div>
  );
};
