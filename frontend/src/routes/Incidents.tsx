import React from 'react';
import { IncidentFilters } from '../components/incidents/IncidentFilters';
import { IncidentTable, mockIncidents } from '../components/incidents/IncidentTable';
import { useDemo } from '../context/DemoContext';

export const Incidents: React.FC = () => {
  const { isDemoMode } = useDemo();

  const handleExport = () => {
    const headers = ['Incident ID', 'Type', 'Severity', 'User', 'Source', 'Detected', 'Status'];
    const csvContent = [
      headers.join(','),
      ...mockIncidents.map(inc => `"${inc.id}","${inc.type}","${inc.severity}","${inc.user}","${inc.source}","${inc.detected}","${inc.status}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `incidents_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isDemoMode) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: 'var(--text-muted)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>No Active Incidents</h2>
        <p>No incidents matching the current filter criteria.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Incidents</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and triage detected security incidents.</p>
        </div>
        
        <button 
          onClick={handleExport}
          style={{
            backgroundColor: 'var(--color-action)',
            color: 'white',
            border: 'none',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Export CSV
        </button>
      </header>

      <IncidentFilters />
      <IncidentTable />
    </div>
  );
};
