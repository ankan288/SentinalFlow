import React from 'react';
import { Activity, LogIn, Database, Lock } from 'lucide-react';
import './RecentEvents.css';

const mockEvents = [
  { id: 'EV-8921', action: 'Failed Login', actor: 'admin@acme.com', target: 'Production VPN', time: 'Just now', icon: Lock, color: 'var(--color-critical)' },
  { id: 'EV-8920', action: 'Database Query', actor: 'svc_reporting', target: 'Customer DB', time: '2m ago', icon: Database, color: 'var(--color-low)' },
  { id: 'EV-8919', action: 'Successful Login', actor: 'j.smith@acme.com', target: 'AWS Console', time: '5m ago', icon: LogIn, color: 'var(--color-success)' },
  { id: 'EV-8918', action: 'Failed Login', actor: 'admin@acme.com', target: 'Production VPN', time: '12m ago', icon: Lock, color: 'var(--color-critical)' },
  { id: 'EV-8917', action: 'Policy Update', actor: 'System', target: 'Firewall Rules', time: '15m ago', icon: Activity, color: 'var(--color-medium)' }
];

export const RecentEvents: React.FC = () => {
  return (
    <div className="recent-events">
      <div className="recent-events-header">
        <h3 className="recent-events-title">
          <Activity size={18} color="var(--text-muted)" aria-hidden="true" />
          Live Event Stream
        </h3>
        <span className="recent-events-live-indicator" aria-label="Status: Live">
          <span className="recent-events-live-dot" aria-hidden="true"></span>
          Live
        </span>
      </div>

      <div className="recent-events-list" role="list" aria-label="Recent Events">
        {mockEvents.map(event => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="recent-event-item" role="listitem">
              <div 
                className="recent-event-icon-wrapper"
                style={{ color: event.color }}
                aria-hidden="true"
              >
                <Icon size={16} />
              </div>
              <div className="recent-event-content">
                <div className="recent-event-action">{event.action}</div>
                <div className="recent-event-details">
                  {event.actor} &rarr; {event.target}
                </div>
              </div>
              <div className="recent-event-time">
                {event.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
