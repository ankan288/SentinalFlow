import React from 'react';
import type { RecommendedAction } from '../../services/aiAnalystService';
import { ShieldAlert, X } from 'lucide-react';
import { Button } from '../common/Button';

interface ResponseReviewModalProps {
  action: RecommendedAction;
  onClose: () => void;
  onApprove: (actionId: string) => void;
  isApproving: boolean;
}

export const ResponseReviewModal: React.FC<ResponseReviewModalProps> = ({ action, onClose, onApprove, isApproving }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          padding: 'var(--space-4) var(--space-6)', 
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Review Response</h2>
          <button onClick={onClose} disabled={isApproving} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Action</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{action.title}</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>AI Recommendation Reason</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{action.reason}</div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Risk Level</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: action.risk === 'HIGH' ? 'var(--color-high)' : 'var(--color-medium)' }}>{action.risk}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Authorization</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-critical)' }}>{action.authorization}</div>
            </div>
          </div>

          <div style={{ 
            marginTop: 'var(--space-2)', 
            padding: 'var(--space-3)', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--color-critical)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-3)',
            color: 'var(--text-primary)'
          }}>
            <ShieldAlert color="var(--color-critical)" />
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Human Approval Required.</strong> By approving this action, you authorize SentinelFlow to execute this remediation in the production environment.
            </div>
          </div>
        </div>

        <div style={{ 
          padding: 'var(--space-4) var(--space-6)', 
          borderTop: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
        }}>
          <Button variant="secondary" onClick={onClose} disabled={isApproving}>Cancel</Button>
          <Button variant="primary" onClick={() => onApprove(action.id)} disabled={isApproving}>
            {isApproving ? 'Approving...' : 'Approve Action'}
          </Button>
        </div>
      </div>
    </div>
  );
};
