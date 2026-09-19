import React from 'react';
import { SecurityOverview } from '../components/dashboard/SecurityOverview';
import { IncidentSummary } from '../components/dashboard/IncidentSummary';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RecentEvents } from '../components/dashboard/RecentEvents';
import { useDemo } from '../context/DemoContext';
import GatewayFlow from '../components/ui/gateway-flow';

export const Dashboard: React.FC = () => {
  const { isDemoMode } = useDemo();

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      
      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        {!isDemoMode ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: 'var(--text-muted)' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>Awaiting Live Data</h2>
            <p>SentinelFlow is currently monitoring the environment. No incidents detected.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
            <header>
              <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Security Overview</h1>
              <p style={{ color: 'var(--text-secondary)' }}>System status and active threats across your organization.</p>
            </header>
            
            <SecurityOverview />
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gridTemplateRows: '300px', 
              gap: 'var(--space-6)',
              marginBottom: 'var(--space-6)'
            }}>
              <IncidentSummary />
              <RiskDistribution />
            </div>

            <div style={{ height: '350px' }}>
              <RecentEvents />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
