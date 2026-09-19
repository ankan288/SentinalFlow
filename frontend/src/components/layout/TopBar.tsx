import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Zap, LogOut } from 'lucide-react';
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

export const TopBar: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = useDemo();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isNotifOpen) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNotifOpen]);

  const handleLogout = () => {
    localStorage.removeItem('sentinel_auth');
    window.location.href = '/login';
  };

  const goToProfile = () => {
    navigate('/settings');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    if (notification.relatedIncidentId) {
      navigate(`/incidents/${notification.relatedIncidentId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="topbar" style={{ zIndex: 100 }}>
      <div className="topbar-left" style={{ flex: 1, minWidth: 0 }}>
        {/* Search Bar - hidden on very small screens via CSS later if needed, but flex:1 handles it mostly */}
        <div className="search-container" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search events, IPs, users..." 
            className="topbar-search"
            style={{ paddingLeft: '32px' }}
          />
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

