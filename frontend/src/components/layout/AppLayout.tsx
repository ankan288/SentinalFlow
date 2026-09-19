import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BlackHoleHeroSection } from '../ui/blackhole-hero-section';
import './Layout.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <BlackHoleHeroSection 
          distance={26}
          elevation={-15}
          fov={60}
          spinSpeed={0.03}
          glow={0.8}
          className="w-full h-full"
        />
      </div>
      <Sidebar />
      
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <TopBar />
        
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
