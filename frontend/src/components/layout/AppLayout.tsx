import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import GatewayFlow from '../ui/gateway-flow';
import './Layout.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <GatewayFlow mode="dark" />
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
