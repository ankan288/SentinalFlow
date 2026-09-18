import React, { useState } from 'react';
import { Shield, Key, Globe, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import './ActionCard.css';

interface ActionData {
  id: string;
  title: string;
  type: 'session' | 'mfa' | 'network';
  reason: string;
  risk: 'Low' | 'Medium' | 'High';
  authStatus: 'Cedar Authorized' | 'Pending Admin' | 'Blocked';
  approved: boolean;
}

interface ActionCardProps {
  action: ActionData;
  onApprove: (id: string) => Promise<void> | void;
  onReview: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onApprove, onReview }) => {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(action.id);
    } finally {
      setIsApproving(false);
    }
  };

  const getIcon = () => {
    switch (action.type) {
      case 'session': return <Key size={18} />;
      case 'mfa': return <Shield size={18} />;
      case 'network': return <Globe size={18} />;
    }
  };

  const getRiskClass = () => {
    switch (action.risk) {
      case 'Low': return 'low';
      case 'Medium': return 'medium';
      case 'High': return 'high';
    }
  };

  if (action.approved) {
    return (
      <div className="action-card approved">
        <div className="action-card-approved-content">
          <CheckCircle2 size={20} color="var(--color-success)" />
          <div>
            <div className="action-card-title">{action.title}</div>
            <div className="action-card-approved-text">Executed Successfully</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-card">
      <div className="action-card-header">
        <div className="action-card-title-group">
          <div className="action-card-icon">{getIcon()}</div>
          <span className="action-card-title">{action.title}</span>
        </div>
        <span className="action-card-status">
          {action.authStatus}
        </span>
      </div>

      <div className="action-card-reason">
        <strong>AI Reason:</strong> {action.reason}
      </div>

      <div className="action-card-footer">
        <div className={`action-card-risk ${getRiskClass()}`}>
          <AlertOctagon size={14} />
          Impact Risk: {action.risk}
        </div>
        <div className="action-card-actions">
          <Button variant="secondary" onClick={() => onReview(action.id)} style={{ padding: 'var(--space-1) var(--space-3)' }}>Review</Button>
          <Button variant="danger" onClick={handleApprove} isLoading={isApproving} style={{ padding: 'var(--space-1) var(--space-3)' }}>Approve</Button>
        </div>
      </div>
    </div>
  );
};
