import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './routes/Dashboard';
import { Incidents } from './routes/Incidents';
import { IncidentDetail } from './routes/IncidentDetail';
import { AttackGraph } from './routes/AttackGraph';
import { AIAnalyst } from './routes/AIAnalyst';
import { AuditLog } from './routes/AuditLog';
import { Login } from './routes/Login';
import { Register } from './routes/Register';
import { Welcome } from './routes/Welcome';
import { DemoProvider } from './context/DemoContext';
import { ResponseProvider } from './context/ResponseContext';

import { authService } from './services/auth/authService';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Placeholders for other routes until we build them
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
    <h2>{title}</h2>
    <p>This view will be implemented in a later phase.</p>
  </div>
);

function App() {
  return (
    <DemoProvider>
      <ResponseProvider>
        <BrowserRouter>
          <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="attack-graph" element={<AttackGraph />} />
          <Route path="ai-analyst" element={<AIAnalyst />} />
          <Route path="events" element={<Placeholder title="Events" />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
        
        {/* Catch-all 404 redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </BrowserRouter>
      </ResponseProvider>
    </DemoProvider>
  );
}

export default App;
