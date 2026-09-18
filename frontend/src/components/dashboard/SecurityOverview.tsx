import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Activity } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  colorVar: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, subtitle, icon, colorVar }) => (
  <div style={{
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)'
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

export const SecurityOverview: React.FC = () => {
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
