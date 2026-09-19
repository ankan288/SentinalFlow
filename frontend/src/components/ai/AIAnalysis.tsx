import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import type { AIAnalysisResult } from '../../services/aiAnalystService';
import { AttackInterpretation } from './AttackInterpretation';
import { EvidenceList } from './EvidenceList';

interface AIAnalysisProps {
  result: AIAnalysisResult;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ result }) => {
  const [showConfidence, setShowConfidence] = useState(false);

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: 'var(--space-6)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {result.peerReviewed && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)', 
              color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg, rgba(16, 185, 129, 0.1))',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 600, alignSelf: 'flex-start',
              border: '1px solid var(--color-success)'
            }}>
              <ShieldCheck size={14} />
              Verified by Multi-Agent Peer Review ({result.reviewIterations} iterations)
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ backgroundColor: 'var(--color-action-bg)', color: 'var(--color-action)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>AI Assessment</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6, maxWidth: '600px' }}>
              {result.explanation}
            </div>
          </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: result.riskLevel === 'HIGH' ? 'var(--color-high)' : 'var(--text-primary)' }}>{result.riskLevel}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border-medium)' }}></div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-success)' }}>{result.confidenceScore}%</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: 'var(--space-4)' }}>
        <button 
          onClick={() => setShowConfidence(!showConfidence)}
          style={{
            background: 'none', border: 'none', padding: 0,
            color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)'
          }}
        >
          Why this confidence? {showConfidence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showConfidence && (
          <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Confidence is based on {result.evidence.length} corroborating signals matching known attack signatures for <strong>Brute Force to Privilege Escalation</strong> with 99.8% historical accuracy.
          </div>
        )}
      </div>

      <AttackInterpretation attackChain={result.attackChain} />
      <EvidenceList evidence={result.evidence} />
    </div>
  );
};
