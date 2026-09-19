import React from 'react';
import { PieChart } from 'lucide-react';

export const RiskDistribution: React.FC = () => {
  // Mock data
  const data = [
    { label: 'Critical', value: 2, color: 'var(--color-critical)' },
    { label: 'High', value: 8, color: 'var(--color-high)' },
    { label: 'Medium', value: 24, color: 'var(--color-medium)' },
    { label: 'Low', value: 66, color: 'var(--color-low)' },
  ];

  return (
    <div style={{
      backgroundColor: 'rgba(8, 13, 23, 0.55)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.26)',
      borderRadius: '16px',
      padding: 'var(--space-4)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '1rem', margin: 0, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <PieChart size={18} color="var(--text-muted)" />
        Risk Distribution
      </h3>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-4)' }}>
        {data.map(item => (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontWeight: 600 }}>{item.value}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${item.value}%`, 
                height: '100%', 
                backgroundColor: item.color,
                borderRadius: 'var(--radius-full)'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
