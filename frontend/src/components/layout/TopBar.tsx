import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Search, Zap, LogOut, X } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import DropdownMenu01 from '../ui/dropdown-menu-01';
import './Layout.css';

type NotificationType = 'incident' | 'system' | 'security' | 'response';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  relatedIncidentId?: string;
  colorCode: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notification-001",
    title: "Credential Compromise",
    message: "Multiple failed logins for admin@acme.com detected 10 mins ago.",
    timestamp: "10 mins ago",
    read: false,
    type: "incident",
    relatedIncidentId: "047",
    colorCode: "var(--color-critical)"
  },
  {
    id: "notification-002",
    title: "Unusual Exfiltration",
    message: "Large data transfer detected from Server-04.",
    timestamp: "2 hours ago",
    read: false,
    type: "incident",
    relatedIncidentId: "046",
    colorCode: "var(--color-warning)"
  }
];

import { mockIncidents } from '../incidents/IncidentTable';
import { mockEvents } from '../../services/eventsService';

interface SearchResult {
  id: string;
  category: 'INCIDENTS' | 'EVENTS' | 'USERS' | 'DEVICES' | 'RESOURCES';
  title: string;
  subtitle: string;
  route?: string;
}

export const TopBar: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = useDemo();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('sentinelflow_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_NOTIFICATIONS;
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('sentinelflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isNotifOpen) setIsNotifOpen(false);
        if (isSearchOpen) {
          setIsSearchOpen(false);
          searchInputRef.current?.blur();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNotifOpen, isSearchOpen]);

  const handleLogout = () => {
    localStorage.removeItem('sentinel_auth');
    window.location.href = '/login';
  };


  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    if (notification.relatedIncidentId) {
      const incidentId = notification.relatedIncidentId.startsWith('INC-') ? notification.relatedIncidentId : `INC-${notification.relatedIncidentId}`;
      navigate(`/incidents/${incidentId}`);
    }
  };

  // Search Logic
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    // safe match helper
    const match = (str?: string) => str ? str.toLowerCase().includes(lowerQuery) : false;

    const results: SearchResult[] = [];

    // 1. Search Incidents
    mockIncidents.forEach(inc => {
      if (
        match(inc.id) || match(inc.type) || match(inc.severity) || match(inc.status) || match(inc.user) || match(inc.source) || match(inc.detected)
      ) {
        results.push({
          id: inc.id,
          category: 'INCIDENTS',
          title: inc.type,
          subtitle: `${inc.id} · ${inc.severity.toUpperCase()} · ${inc.status}`,
          route: `/incidents/${inc.id}`
        });
      }
    });

    // 2. Search Events
    mockEvents.forEach(evt => {
      if (
        match(evt.id) || match(evt.type) || match(evt.description) || match(evt.source) || match(evt.user) || match(evt.resource) || match(evt.device) || match(evt.severity) || match(evt.status) || match(evt.timestamp)
      ) {
        results.push({
          id: evt.id,
          category: 'EVENTS',
          title: evt.description || evt.type,
          subtitle: `${evt.user || evt.source} ${evt.resource ? `→ ${evt.resource}` : ''}`,
          route: `/events`
        });
      }
    });

    // Extract unique Users, Devices, Resources from both
    const usersMap = new Map<string, string>();
    const devicesMap = new Map<string, string>();
    const resourcesMap = new Map<string, string>();

    mockIncidents.forEach(inc => {
      if (inc.user) usersMap.set(inc.user, 'User');
    });

    mockEvents.forEach(evt => {
      if (evt.user) usersMap.set(evt.user, evt.previousRole || 'User');
      if (evt.device) devicesMap.set(evt.device, 'Device');
      if (evt.resource) resourcesMap.set(evt.resource, 'Resource');
    });

    // Hardcode some known users to supplement
    usersMap.set('admin@acme.com', 'Super Admin');
    usersMap.set('john.doe', 'Viewer');
    usersMap.set('sarah.smith', 'Security Analyst');

    // 3. Search Users
    usersMap.forEach((role, user) => {
      if (match(user) || match(role)) {
        results.push({
          id: `usr-${user}`,
          category: 'USERS',
          title: user,
          subtitle: role,
          route: '/settings'
        });
      }
    });

    // 4. Search Devices
    devicesMap.forEach((type, device) => {
      if (match(device) || match(type)) {
        results.push({
          id: `dev-${device}`,
          category: 'DEVICES',
          title: device,
          subtitle: 'Device',
          route: ''
        });
      }
    });

    // 5. Search Resources
    resourcesMap.forEach((type, resource) => {
      if (match(resource) || match(type)) {
        results.push({
          id: `res-${resource}`,
          category: 'RESOURCES',
          title: resource,
          subtitle: 'Resource',
          route: ''
        });
      }
    });

    // Extra matches requested like Database matching Customer DB
    if (lowerQuery.includes('data')) {
      resourcesMap.forEach((_type, resource) => {
        if (resource.toLowerCase().includes('db') && !results.find(r => r.id === `res-${resource}`)) {
          results.push({
            id: `res-${resource}`,
            category: 'RESOURCES',
            title: resource,
            subtitle: 'Resource',
            route: ''
          });
        }
      });
    }

    return results;
  }, [searchQuery]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = { INCIDENTS: [], EVENTS: [], USERS: [], DEVICES: [], RESOURCES: [] };
    filteredResults.forEach(item => {
      if (groups[item.category].length < 3) {
        groups[item.category].push(item);
      }
    });
    return groups;
  }, [filteredResults]);

  const flatGroupedResults = useMemo(() => {
    const flat: SearchResult[] = [];
    if (groupedResults.INCIDENTS.length) flat.push(...groupedResults.INCIDENTS);
    if (groupedResults.EVENTS.length) flat.push(...groupedResults.EVENTS);
    if (groupedResults.USERS.length) flat.push(...groupedResults.USERS);
    if (groupedResults.DEVICES.length) flat.push(...groupedResults.DEVICES);
    if (groupedResults.RESOURCES.length) flat.push(...groupedResults.RESOURCES);
    return flat;
  }, [groupedResults]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatGroupedResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatGroupedResults.length) {
        handleResultClick(flatGroupedResults[selectedIndex]);
      } else if (flatGroupedResults.length > 0) {
        handleResultClick(flatGroupedResults[0]);
      }
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (result.route) {
      navigate(result.route);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="topbar" style={{ zIndex: 100 }}>
      <div className="topbar-left" style={{ flex: 1, minWidth: 0 }}>
        {/* Search Bar */}
        <div ref={searchRef} className="search-container" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search events, IPs, users..." 
            className="topbar-search"
            style={{ paddingLeft: '32px', paddingRight: searchQuery ? '32px' : '12px' }}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery) setIsSearchOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
                searchInputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              marginTop: '8px',
              backgroundColor: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              zIndex: 101,
              overflow: 'hidden'
            }}>
              {flatGroupedResults.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  <div style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>No results found</div>
                  Try searching for an incident ID, user, IP address, or event.
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
                  {['INCIDENTS', 'EVENTS', 'USERS', 'DEVICES', 'RESOURCES'].map((category) => {
                    const items = groupedResults[category as keyof typeof groupedResults];
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <div style={{ 
                          padding: '4px 12px', 
                          fontSize: '0.7rem', 
                          fontWeight: 600, 
                          color: 'var(--text-muted)', 
                          letterSpacing: '0.05em' 
                        }}>
                          {category}
                        </div>
                        {items.map((item) => {
                          const isSelected = flatGroupedResults[selectedIndex]?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              onMouseEnter={() => {
                                const idx = flatGroupedResults.findIndex(r => r.id === item.id);
                                if (idx !== -1) setSelectedIndex(idx);
                              }}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'var(--color-primary-bg)' : 'transparent',
                                borderLeft: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                                transition: 'background-color 0.1s'
                              }}
                            >
                              <div style={{ 
                                fontSize: '0.85rem', 
                                color: isSelected ? '#fff' : 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                {category === 'INCIDENTS' && <span style={{ color: item.subtitle.includes('HIGH') || item.subtitle.includes('CRITICAL') ? 'var(--color-critical)' : 'var(--color-warning)' }}>⚠</span>}
                                {item.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {item.subtitle}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        
      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Demo Mode Toggle */}
        <button 
          onClick={toggleDemoMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: isDemoMode ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
            border: `1px solid ${isDemoMode ? 'var(--color-success)' : 'var(--border-strong)'}`,
            color: isDemoMode ? 'var(--color-success)' : 'var(--text-muted)',
            padding: '4px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          title="Toggle Hackathon Demo Mode"
        >
          <Zap size={14} />
          {isDemoMode ? 'DEMO ACTIVE' : 'REAL DATA'}
        </button>
        
        {/* Notifications Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="icon-button" 
            aria-label="Notifications" 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: 'var(--color-critical)', borderRadius: '50%' }}></span>
            )}
          </button>
          {isNotifOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '320px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '16px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)', zIndex: 50 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Notifications</h4>
                <button 
                  onClick={handleMarkAllRead}
                  style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  aria-label="Mark all read"
                >
                  Mark all read
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotificationClick(notification);
                        }
                      }}
                      style={{ 
                        padding: '10px', 
                        backgroundColor: notification.read ? 'transparent' : 'var(--bg-tertiary)', 
                        borderRadius: '6px', 
                        borderLeft: `3px solid ${notification.colorCode}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: notification.read ? 0.6 : 1
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: notification.read ? 400 : 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {notification.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile Dropdown */}
        <DropdownMenu01 />

        {/* Logout Button */}
        <button className="icon-button" aria-label="Log Out" onClick={handleLogout} style={{ color: 'var(--color-critical)' }}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
