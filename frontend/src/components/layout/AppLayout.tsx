import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import './Layout.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      
      <div className="main-content">
        <TopBar />
        
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
