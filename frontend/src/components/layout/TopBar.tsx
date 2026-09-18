import React from 'react';
import { Bell, Search, User, Zap, LogOut } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import './Layout.css';

export const TopBar: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = useDemo();

  const handleLogout = () => {
    localStorage.removeItem('sentinel_auth');
    window.location.href = '/login';
  };

  return (
    <header className="topbar">
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
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
          
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
          </button>
          
          <button className="icon-button" aria-label="User Profile">
            <User size={20} />
          </button>

          <button className="icon-button" aria-label="Log Out" onClick={handleLogout} style={{ color: 'var(--color-critical)' }}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
