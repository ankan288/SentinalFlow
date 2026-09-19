import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import type { Incident } from '../../services/incidentsService';
import type { SecurityEvent } from '../../services/eventsService';

interface OverviewCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  colorVar: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, subtitle, icon, colorVar }) => (
  <div style={{
    backgroundColor: 'rgba(10, 15, 25, 0.52)',
    backdropFilter: 'blur(16px) saturate(120%)',
    WebkitBackdropFilter: 'blur(16px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.24)',
    borderRadius: '14px',
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    transition: 'all 0.2s ease',
    cursor: 'default'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(15, 22, 35, 0.6)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(10, 15, 25, 0.52)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
      <div style={{ color: `var(${colorVar})` }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>
    )}
  </div>
);

export const SecurityOverview: React.FC<{ realData?: { incidents: Incident[], events: SecurityEvent[], loading: boolean } }> = ({ realData }) => {
  if (realData) {
    const { incidents, events, loading } = realData;
    
    // In a real environment with NO events API, total events is 0
    const totalEvents = events.length;
    
    const activeIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
    const highRisk = incidents.filter(i => i.severity === 'High' || i.severity === 'Critical').length;
    const resolved = incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <OverviewCard 
          title="Total Events (24h)" 
          value={loading ? "..." : totalEvents.toString()} 
          subtitle={(!loading && totalEvents === 0) ? "No events received yet" : ""}
          icon={<Activity size={20} />} 
          colorVar="--color-low" 
        />
        <OverviewCard 
          title="Active Incidents" 
          value={loading ? "..." : activeIncidents.toString()} 
          subtitle={(!loading && activeIncidents === 0) ? "No active incidents" : "Requires immediate attention"}
          icon={<AlertCircle size={20} />} 
          colorVar="--color-critical" 
        />
        <OverviewCard 
          title="High Risk" 
          value={loading ? "..." : highRisk.toString()} 
          subtitle={(!loading && highRisk === 0) ? "No high-risk incidents" : "Requires attention"}
          icon={<ShieldAlert size={20} />} 
          colorVar="--color-high" 
        />
        <OverviewCard 
          title="Resolved" 
          value={loading ? "..." : resolved.toString()} 
          subtitle={(!loading && resolved === 0) ? "No incidents resolved" : ""}
          icon={<CheckCircle size={20} />} 
          colorVar="--color-success" 
        />
      </div>
    );
  }

  // Original Demo Mode UI
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-6)'
    }}>
      <OverviewCard 
        title="Total Events (24h)" 
        value="142,304" 
        subtitle="+12% from yesterday"
        icon={<Activity size={20} />} 
        colorVar="--color-low" 
      />
      <OverviewCard 
        title="Active Incidents" 
        value="3" 
        subtitle="Requires immediate attention"
        icon={<AlertCircle size={20} />} 
        colorVar="--color-critical" 
      />
      <OverviewCard 
        title="High Risk" 
        value="1" 
        subtitle="Credential Compromise"
        icon={<ShieldAlert size={20} />} 
        colorVar="--color-high" 
      />
      <OverviewCard 
        title="Resolved" 
        value="12" 
        subtitle="Automated: 8, Manual: 4"
        icon={<CheckCircle size={20} />} 
        colorVar="--color-success" 
      />
    </div>
  );
};
