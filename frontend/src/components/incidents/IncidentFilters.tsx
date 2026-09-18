import React from 'react';
import { Filter, Search } from 'lucide-react';

export const IncidentFilters: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-6)',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', marginRight: 'var(--space-4)' }}>
        <Filter size={18} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Filters</span>
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by ID, User, or Source..." 
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3) var(--space-2) 32px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
      </div>

      <select style={selectStyle}>
        <option value="">Severity: All</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select style={selectStyle}>
        <option value="">Status: All</option>
        <option value="active">Active</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
      </select>

      <select style={selectStyle}>
        <option value="">Time: Last 24h</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-3)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer'
};
