import React from 'react';
import { ActionCard } from './ActionCard';
import { CheckSquare } from 'lucide-react';
import { useResponse } from '../../context/ResponseContext';
import { useParams } from 'react-router-dom';

export const ResponsePanel: React.FC = () => {
  const { actions, approveAction } = useResponse();
  const { id: incidentId } = useParams();

  const handleApprove = (id: string) => {
    approveAction(id, incidentId);
  };

  const handleReview = (id: string) => {
    alert(`Opening review modal for action ${id}... (Will be built later if needed)`);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
          <CheckSquare size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Recommended Response</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Human approval required for execution</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {actions.map(action => (
          <ActionCard 
            key={action.id} 
            action={action} 
            onApprove={handleApprove} 
            onReview={handleReview} 
          />
        ))}
      </div>
      
      {actions.every(a => a.approved) && (
        <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
          All recommended actions executed successfully!
        </div>
      )}
    </div>
  );
};
