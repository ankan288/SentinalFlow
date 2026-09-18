import React from 'react';
import { useParams } from 'react-router-dom';
import { IncidentHeader } from '../components/incidents/IncidentHeader';
import { EvidencePanel } from '../components/incidents/EvidencePanel';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { AttackGraphCanvas } from '../components/attack-graph/AttackGraphCanvas';
import { AIAnalystPanel } from '../components/ai/AIAnalystPanel';
import { ResponsePanel } from '../components/response/ResponsePanel';
import { useDemo } from '../context/DemoContext';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams();
  const { isDemoMode } = useDemo();

  if (!isDemoMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <IncidentHeader />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', color: 'var(--text-muted)' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Awaiting Live Data</h2>
          <p>SentinelFlow is currently monitoring the environment. No incident data available.</p>
        </div>
      </div>
    );
  }

  if (id !== 'INC-047') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <IncidentHeader />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', color: 'var(--text-muted)' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Insufficient Data for {id}</h2>
          <p>This incident type does not currently have enough event correlation to generate an Attack Graph or AI Analysis.</p>
          <p style={{ marginTop: 'var(--space-4)', fontSize: '0.875rem' }}>(For the hackathon demo, please view incident INC-047)</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <IncidentHeader />
      
      <div className="responsive-grid" style={{ flex: 1 }}>
        {/* Left Column: Attack Story, AI Analyst, Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <AttackGraphCanvas />

          <AIAnalystPanel />

          <ResponsePanel />

        </div>

        {/* Right Column: Evidence & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <EvidencePanel />
          <IncidentTimeline />
        </div>
      </div>
    </div>
  );
};
