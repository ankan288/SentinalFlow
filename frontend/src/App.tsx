import React from 'react';
import { Events } from './routes/Events';
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
import { Settings } from './routes/Settings';
import { DemoProvider } from './context/DemoContext';
import { ResponseProvider } from './context/ResponseContext';

import { authService } from './services/auth/authService';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};



function App() {
  // console.log("SentinelFlow App Initialized");
  return (
    <DemoProvider>
      <ResponseProvider>
        <BrowserRouter>
          <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/attack-graph" element={<AttackGraph />} />
          <Route path="/ai-analyst" element={<AIAnalyst />} />
          <Route path="/events" element={<Events />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/settings" element={<Settings />} />
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
