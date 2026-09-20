import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Network, 
  Bot, 
  Activity, 
  FileText, 
  Settings
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/attack-graph', label: 'Attack Graph', icon: Network },
  { path: '/ai-analyst', label: 'AI Analyst', icon: Bot },
  { path: '/events', label: 'Events', icon: Activity },
  { path: '/audit', label: 'Audit Log', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="SentinelFlow Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        <span>SentinelFlow</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
