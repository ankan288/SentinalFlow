import React, { useEffect, useState } from 'react';
import { SecurityOverview } from '../components/dashboard/SecurityOverview';
import { IncidentSummary } from '../components/dashboard/IncidentSummary';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RecentEvents } from '../components/dashboard/RecentEvents';
import { useDemo } from '../context/DemoContext';
import { incidentsService } from '../services/incidentsService';
import type { Incident } from '../services/incidentsService';
import type { SecurityEvent } from '../services/eventsService';

export const Dashboard: React.FC = () => {
  const { isDemoMode } = useDemo();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isDemoMode) return;
    
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await incidentsService.getIncidents(100);
        if (isMounted) {
          setIncidents(res.incidents);
          setEvents([]); // Backend has no /events API yet, so we reflect reality
          setError(false);
        }
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isDemoMode]);

  if (!isDemoMode && error) {
    return (
      <div style={{ position: 'relative', minHeight: '100%' }}>
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Security Data Unavailable</h2>
          <p>SentinelFlow cannot currently receive security events from the backend.</p>
        </div>
      </div>
    );
  }

  const realData = isDemoMode ? undefined : { incidents, events, loading };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
          <header>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Security Overview</h1>
            <p style={{ color: 'var(--text-secondary)' }}>System status and active threats across your organization.</p>
          </header>
          
          <SecurityOverview realData={realData} />
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: '300px', 
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-6)'
          }}>
            <IncidentSummary realData={realData} />
            <RiskDistribution realData={realData} />
          </div>

          <div style={{ height: '350px' }}>
            <RecentEvents realData={realData} />
          </div>
        </div>
      </div>
    </div>
  );
};
