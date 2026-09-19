import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '../common/Button';
import type { EventSeverity, EventType } from '../../services/eventsService';

export interface EventFiltersState {
  search: string;
  severity: EventSeverity | 'All';
  type: EventType | 'All';
}

interface EventFiltersProps {
  filters: EventFiltersState;
  onFilterChange: (filters: EventFiltersState) => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({ filters, onFilterChange }) => {
  const handleReset = () => {
    onFilterChange({
      search: '',
      severity: 'All',
      type: 'All'
    });
  };

  const hasActiveFilters = filters.search !== '' || filters.severity !== 'All' || filters.type !== 'All';

  const selectStyle = {
    backgroundColor: 'rgba(10, 15, 25, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.875rem',
    outline: 'none',
    minWidth: '120px'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 'var(--space-4)', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: 'var(--space-4)',
      padding: 'var(--space-4)',
      backgroundColor: 'rgba(10, 15, 25, 0.50)',
      backdropFilter: 'blur(16px) saturate(120%)',
      WebkitBackdropFilter: 'blur(16px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <div style={{ 
        position: 'relative',
        flex: '1 1 300px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search events, IPs, users..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            backgroundColor: 'rgba(5, 8, 15, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
        {filters.search && (
          <button 
            onClick={() => onFilterChange({ ...filters, search: '' })}
            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
        <select 
          value={filters.severity} 
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value as any })}
          style={selectStyle}
        >
          <option value="All">Severity: All</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFO">Info</option>
        </select>

        <select 
          value={filters.type} 
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value as any })}
          style={selectStyle}
        >
          <option value="All">Type: All</option>
          <option value="Authentication">Authentication</option>
          <option value="Authorization">Authorization</option>
          <option value="Privilege">Privilege</option>
          <option value="Device">Device</option>
          <option value="Network">Network</option>
          <option value="Resource Access">Resource Access</option>
          <option value="System">System</option>
        </select>

        {hasActiveFilters && (
          <Button variant="secondary" onClick={handleReset} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
