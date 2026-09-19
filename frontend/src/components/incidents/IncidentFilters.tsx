import React from 'react';
import { Filter, Search } from 'lucide-react';

export const IncidentFilters: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      backgroundColor: 'rgba(10, 15, 25, 0.52)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.24)',
      borderRadius: '14px',
      marginBottom: 'var(--space-6)',
      alignItems: 'center'
    }}>
      <style>{`
        .glass-select {
          background-color: rgba(7, 12, 21, 0.62);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: var(--radius-md);
          padding: var(--space-2) var(--space-3);
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .glass-select:hover, .glass-select:focus {
          background-color: rgba(15, 22, 35, 0.70);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .glass-select option {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
      `}</style>
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
            backgroundColor: 'rgba(7, 12, 21, 0.62)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3) var(--space-2) 32px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
      </div>

      <select className="glass-select">
        <option value="">Severity: All</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select className="glass-select">
        <option value="">Status: All</option>
        <option value="active">Active</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
      </select>

      <select className="glass-select">
        <option value="">Time: Last 24h</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>
    </div>
  );
};
