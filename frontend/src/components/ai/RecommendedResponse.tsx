import React from 'react';
import type { RecommendedAction } from '../../services/aiAnalystService';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

interface RecommendedResponseProps {
  recommendations: RecommendedAction[];
  onReviewAction: (action: RecommendedAction) => void;
}

export const RecommendedResponse: React.FC<RecommendedResponseProps> = ({ recommendations, onReviewAction }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: 'var(--space-6)' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
        Recommended Response
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {recommendations.map((rec, index) => (
          <div key={rec.id} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <div style={{ 
                  width: '24px', height: '24px', 
                  borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600
                }}>
                  {index + 1}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{rec.title}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reason:</span> {rec.reason}
                  </div>
                </div>
              </div>
              
              {rec.status === 'SUCCESS' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500, padding: '4px 8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>
                  <ShieldCheck size={16} /> Executed Successfully
                </div>
              ) : rec.status === 'APPROVED' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-action)', fontSize: '0.875rem', fontWeight: 500 }}>
                  <Loader2 size={16} className="animate-spin" /> Executing...
                </div>
              ) : (
                <Button variant="primary" onClick={() => onReviewAction(rec)}>Review</Button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>Risk:</span>
                <span style={{ fontSize: '0.75rem', color: rec.risk === 'HIGH' ? 'var(--color-high)' : 'var(--color-medium)', fontWeight: 600 }}>{rec.risk}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>Authorization:</span>
                <span style={{ fontSize: '0.75rem', color: rec.status === 'SUCCESS' ? 'var(--color-success)' : 'var(--color-critical)', fontWeight: 600 }}>
                  {rec.status === 'SUCCESS' ? 'CEDAR AUTHORIZED' : rec.authorization}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
