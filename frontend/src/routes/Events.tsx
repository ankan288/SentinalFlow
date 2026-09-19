import React, { useState, useEffect, useMemo } from 'react';
import { EventSummaryCards } from '../components/events/EventSummaryCards';
import { EventFilters } from '../components/events/EventFilters';
import type { EventFiltersState } from '../components/events/EventFilters';
import { EventTable } from '../components/events/EventTable';
import { EventDetailsDrawer } from '../components/events/EventDetailsDrawer';
import { eventsService } from '../services/eventsService';
import type { SecurityEvent } from '../services/eventsService';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<EventFiltersState>({
    search: '',
    severity: 'All',
    type: 'All'
  });
  
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch (err) {
      setError('Unable to load security events.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      const searchMatch = filters.search === '' || 
        event.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.source.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.type.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.resource.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase());

      // Severity filter
      const severityMatch = filters.severity === 'All' || event.severity === filters.severity;
      
      // Type filter
      const typeMatch = filters.type === 'All' || event.type === filters.type;

      return searchMatch && severityMatch && typeMatch;
    });
  }, [events, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 'var(--space-8)' }}>
      <header style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Security Events</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor and investigate raw security activity across your organization.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 8px var(--color-success)' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', letterSpacing: '0.05em' }}>LIVE TELEMETRY</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last updated: Just now</div>
        </div>
      </header>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <EventSummaryCards />
        
        <EventFilters filters={filters} onFilterChange={setFilters} />
        
        {error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: 'var(--color-critical)', marginBottom: 'var(--space-4)' }}>{error}</div>
            <button onClick={fetchEvents} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        ) : (
          <EventTable 
            events={filteredEvents} 
            isLoading={isLoading} 
            onEventClick={setSelectedEvent} 
          />
        )}
      </div>

      <EventDetailsDrawer 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
};
