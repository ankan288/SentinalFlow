import React, { useState, useEffect } from 'react';
import { 
  Building, Shield, BellRing, CheckSquare, Users, Plug, 
  Save, RotateCcw, X, AlertTriangle, Check
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  // Organization
  orgName: "Nexus Security Operations",
  orgId: "ORG-001",
  environment: "Production",
  timezone: "Asia/Kolkata",
  dataRetention: "90 days",

  // Security & Detection
  detectionSensitivity: "High",
  autoIncidentCreation: true,
  eventCorrelation: true,
  privilegeEscalation: true,
  suspiciousLogin: true,
  dataExfiltration: true,

  // Notifications
  notifCritical: true,
  notifHighRisk: true,
  notifSuspicious: true,
  notifAI: true,
  notifResolution: true,
  deliveryInApp: true,
  deliveryEmail: true,

  // Response & Approval
  humanApproval: true,
  criticalApproval: true,
  highRiskApproval: true,
  sessionRevocation: true,
  forceMFA: true,
  blockSourceIp: false,

  // Integrations / Webhook
  webhookUrl: "",
  webhookEnabled: false
};

const SettingsStyles = () => (
  <style>{`
    .settings-glass-card {
      background: rgba(8, 14, 27, 0.65);
      backdrop-filter: blur(14px) saturate(120%);
      -webkit-backdrop-filter: blur(14px) saturate(120%);
      border: 1px solid rgba(100, 150, 210, 0.25);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.2s ease;
    }
    .settings-glass-card:hover {
      background: rgba(8, 14, 27, 0.55);
      border: 1px solid rgba(100, 150, 210, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .settings-glass-input {
      width: 100%;
      padding: 8px 12px;
      background: rgba(15, 25, 45, 0.65);
      border: 1px solid rgba(100, 150, 210, 0.22);
      backdrop-filter: blur(8px);
      border-radius: 6px;
      color: var(--text-primary);
      outline: none;
      transition: all 0.2s ease;
    }
    .settings-glass-input:focus {
      border: 1px solid rgba(100, 150, 210, 0.5);
      box-shadow: 0 0 0 2px rgba(100, 150, 210, 0.2);
    }
    .settings-glass-select {
      appearance: auto;
      cursor: pointer;
    }
    .settings-glass-btn {
      padding: 8px 16px;
      background: rgba(15, 25, 45, 0.65);
      border: 1px solid rgba(100, 150, 210, 0.25);
      color: var(--text-primary);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .settings-glass-btn:hover:not(:disabled) {
      background: rgba(25, 40, 70, 0.75);
      border: 1px solid rgba(100, 150, 210, 0.4);
    }
    .settings-btn-primary {
      background: rgba(30, 80, 180, 0.7);
      color: #fff;
      border: 1px solid rgba(100, 150, 210, 0.5);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
    }
    .settings-btn-primary:hover:not(:disabled) {
      background: rgba(40, 100, 220, 0.8);
      box-shadow: 0 4px 12px rgba(40, 100, 220, 0.3), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .settings-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: rgba(15, 25, 45, 0.65);
      border: 1px solid rgba(100, 150, 210, 0.2);
      box-shadow: none;
    }
    .settings-glass-modal {
      background: rgba(7, 12, 24, 0.82);
      backdrop-filter: blur(18px);
      border: 1px solid rgba(100, 150, 210, 0.25);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
    }
    .settings-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .settings-modal-overlay > div {
      animation: modal-in 0.2s ease-out;
    }
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `}</style>
);

// Reusable Switch Component
const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '40px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: checked ? 'var(--color-success)' : 'rgba(15, 25, 45, 0.65)',
      border: checked ? '1px solid transparent' : '1px solid rgba(100, 150, 210, 0.22)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    }}
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
    role="switch"
    aria-checked={checked}
  >
    <div style={{
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: checked ? 'white' : 'rgba(100, 150, 210, 0.8)',
      position: 'absolute',
      top: checked ? '3px' : '2px',
      left: checked ? '19px' : '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }} />
  </div>
);

// Reusable Select Component
const Select = ({ value, options, onChange }: { value: string, options: string[], onChange: (v: string) => void }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="settings-glass-input settings-glass-select"
  >
    {options.map(o => <option key={o} value={o} style={{ background: '#0a1122' }}>{o}</option>)}
  </select>
);

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sentinelflow_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(merged);
        setSavedSettings(merged);
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setHasChanges(changed);
  }, [settings, savedSettings]);

  const updateSetting = (key: keyof typeof DEFAULT_SETTINGS, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('sentinelflow_settings', JSON.stringify(settings));
    setSavedSettings(settings);
    showNotification("Settings saved successfully.");
  };

  const handleResetChanges = () => {
    setSettings(savedSettings);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setResetConfirm(false);
    showNotification("Settings restored to defaults.");
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  };

  const labelStyle = {
    fontSize: '0.9rem',
    color: 'var(--text-primary)'
  };

  const ModalOverlay = ({ children, onClose }: any) => (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-glass-modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      <SettingsStyles />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your organization's security policies, detection rules, integrations, and response configuration.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {hasChanges && (
            <button 
              onClick={handleResetChanges}
              className="settings-glass-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} /> Reset Changes
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="settings-btn-primary"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* 1. Organization */}
        <div className="settings-glass-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(100, 150, 210, 0.2)', paddingBottom: '12px' }}>
            <Building size={18} /> Organization
          </h3>
          <div style={rowStyle}>
            <span style={labelStyle}>Organization Name</span>
            <div style={{ width: '200px' }}>
              <input 
                type="text" 
                value={settings.orgName} 
                onChange={e => updateSetting('orgName', e.target.value)}
                className="settings-glass-input"
              />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Organization ID</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{settings.orgId}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Environment</span>
            <div style={{ width: '200px' }}>
              <Select value={settings.environment} options={['Production', 'Staging', 'Demo']} onChange={v => updateSetting('environment', v)} />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Timezone</span>
            <div style={{ width: '200px' }}>
              <Select value={settings.timezone} options={['Asia/Kolkata', 'UTC', 'Asia/Singapore', 'Europe/London', 'America/New_York']} onChange={v => updateSetting('timezone', v)} />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Data Retention</span>
            <div style={{ width: '200px' }}>
              <Select value={settings.dataRetention} options={['30 days', '60 days', '90 days', '180 days', '365 days']} onChange={v => updateSetting('dataRetention', v)} />
            </div>
          </div>
        </div>

        {/* 2. Security & Detection */}
        <div className="settings-glass-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(100, 150, 210, 0.2)', paddingBottom: '12px' }}>
            <Shield size={18} /> Security & Detection
          </h3>
          <div style={rowStyle}>
            <span style={labelStyle}>Detection Sensitivity</span>
            <div style={{ width: '120px' }}>
              <Select value={settings.detectionSensitivity} options={['Low', 'Medium', 'High']} onChange={v => updateSetting('detectionSensitivity', v)} />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Automatic Incident Creation</span>
            <ToggleSwitch checked={settings.autoIncidentCreation} onChange={c => updateSetting('autoIncidentCreation', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Event Correlation</span>
            <ToggleSwitch checked={settings.eventCorrelation} onChange={c => updateSetting('eventCorrelation', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Privilege Escalation Detection</span>
            <ToggleSwitch checked={settings.privilegeEscalation} onChange={c => updateSetting('privilegeEscalation', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Suspicious Login Detection</span>
            <ToggleSwitch checked={settings.suspiciousLogin} onChange={c => updateSetting('suspiciousLogin', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Data Exfiltration Detection</span>
            <ToggleSwitch checked={settings.dataExfiltration} onChange={c => updateSetting('dataExfiltration', c)} />
          </div>
        </div>

        {/* 3. Notifications */}
        <div className="settings-glass-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(100, 150, 210, 0.2)', paddingBottom: '12px' }}>
            <BellRing size={18} /> Notifications
          </h3>
          <div style={rowStyle}>
            <span style={labelStyle}>Critical Incidents</span>
            <ToggleSwitch checked={settings.notifCritical} onChange={c => updateSetting('notifCritical', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>High-Risk Incidents</span>
            <ToggleSwitch checked={settings.notifHighRisk} onChange={c => updateSetting('notifHighRisk', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Suspicious Activity</span>
            <ToggleSwitch checked={settings.notifSuspicious} onChange={c => updateSetting('notifSuspicious', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>AI Recommendations</span>
            <ToggleSwitch checked={settings.notifAI} onChange={c => updateSetting('notifAI', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Incident Resolution</span>
            <ToggleSwitch checked={settings.notifResolution} onChange={c => updateSetting('notifResolution', c)} />
          </div>
          <div style={{ height: '1px', backgroundColor: 'rgba(100, 150, 210, 0.2)', margin: '8px 0' }}></div>
          <div style={rowStyle}>
            <span style={labelStyle}>In-App Delivery</span>
            <ToggleSwitch checked={settings.deliveryInApp} onChange={c => updateSetting('deliveryInApp', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Email Delivery</span>
            <ToggleSwitch checked={settings.deliveryEmail} onChange={c => updateSetting('deliveryEmail', c)} />
          </div>
        </div>

        {/* 4. Response & Approval */}
        <div className="settings-glass-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(100, 150, 210, 0.2)', paddingBottom: '12px' }}>
            <CheckSquare size={18} /> Response & Approval
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Control how AI-recommended security actions are authorized before execution.
          </p>
          <div style={rowStyle}>
            <span style={labelStyle}>Human Approval Required</span>
            <ToggleSwitch checked={settings.humanApproval} onChange={c => updateSetting('humanApproval', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Critical Actions Require Approval</span>
            <ToggleSwitch checked={settings.criticalApproval} onChange={c => updateSetting('criticalApproval', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>High-Risk Actions Require Approval</span>
            <ToggleSwitch checked={settings.highRiskApproval} onChange={c => updateSetting('highRiskApproval', c)} />
          </div>
          <div style={{ height: '1px', backgroundColor: 'rgba(100, 150, 210, 0.2)', margin: '8px 0' }}></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Automated Response Actions:</div>
          <div style={rowStyle}>
            <span style={labelStyle}>Session Revocation</span>
            <ToggleSwitch checked={settings.sessionRevocation} onChange={c => updateSetting('sessionRevocation', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Force MFA</span>
            <ToggleSwitch checked={settings.forceMFA} onChange={c => updateSetting('forceMFA', c)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Block Source IP</span>
            <ToggleSwitch checked={settings.blockSourceIp} onChange={c => updateSetting('blockSourceIp', c)} />
          </div>
        </div>

        {/* 5. Access & Roles */}
        <div className="settings-glass-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(100, 150, 210, 0.2)', paddingBottom: '12px' }}>
            <Users size={18} /> Access & Roles
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '16px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>12</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>3</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Roles</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button 
              onClick={() => setActiveModal('manage-users')}
              className="settings-glass-btn"
              style={{ flex: 1 }}
            >
              Manage Users
            </button>
            <button 
              onClick={() => setActiveModal('manage-roles')}
              className="settings-glass-btn"
              style={{ flex: 1 }}
            >
              Manage Roles
            </button>
          </div>
        </div>

        {/* 6. Integrations */}
        <div className="settings-glass-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(100, 150, 210, 0.2)', paddingBottom: '12px' }}>
            <Plug size={18} /> Integrations
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Demo integration configuration.</p>
          
          <div style={rowStyle}>
            <span style={labelStyle}>AWS CloudTrail</span>
            <button onClick={() => setActiveModal('integration-cloudtrail')} style={{ background: 'none', border: 'none', color: 'var(--color-success)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Connected</button>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Amazon CloudWatch</span>
            <button onClick={() => setActiveModal('integration-cloudwatch')} style={{ background: 'none', border: 'none', color: 'var(--color-success)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Connected</button>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>AWS Security Hub</span>
            <button onClick={() => setActiveModal('integration-securityhub')} style={{ background: 'none', border: 'none', color: 'var(--color-success)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Connected</button>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Amazon Cognito</span>
            <button onClick={() => setActiveModal('integration-cognito')} style={{ background: 'none', border: 'none', color: 'var(--color-success)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Connected</button>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Email</span>
            <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Connected</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Webhook</span>
            {settings.webhookEnabled ? (
              <button onClick={() => setActiveModal('webhook')} style={{ background: 'none', border: 'none', color: 'var(--color-success)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Connected</button>
            ) : (
              <button onClick={() => setActiveModal('webhook')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Configure</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          onClick={() => setResetConfirm(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'var(--color-critical)',
            border: '1px solid transparent',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textDecoration: 'underline'
          }}
        >
          Reset to Default Settings
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '1px solid var(--color-success)',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          animation: 'fade-in 0.3s'
        }}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Modals */}
      {activeModal === 'manage-users' && (
        <ModalOverlay onClose={() => setActiveModal(null)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Users</h2>
            <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Admin User', email: 'admin@nexus.net', role: 'Super Admin', status: 'Active' },
              { name: 'Sarah Smith', email: 'sarah.smith@nexus.net', role: 'Security Analyst', status: 'Active' },
              { name: 'John Doe', email: 'john.doe@nexus.net', role: 'Viewer', status: 'Active' },
            ].map(u => (
              <div key={u.email} style={{ padding: '12px', background: 'rgba(15, 25, 45, 0.4)', borderRadius: '8px', border: '1px solid rgba(100, 150, 210, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{u.role}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>{u.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModalOverlay>
      )}

      {activeModal === 'manage-roles' && (
        <ModalOverlay onClose={() => setActiveModal(null)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Roles</h2>
            <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(15, 25, 45, 0.4)', borderRadius: '8px', border: '1px solid rgba(100, 150, 210, 0.15)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Super Admin</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full system access</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(15, 25, 45, 0.4)', borderRadius: '8px', border: '1px solid rgba(100, 150, 210, 0.15)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Security Analyst</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Investigate incidents, View events, AI Analyst access</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(15, 25, 45, 0.4)', borderRadius: '8px', border: '1px solid rgba(100, 150, 210, 0.15)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Viewer</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Read-only access</div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {activeModal && activeModal.startsWith('integration-') && (
        <ModalOverlay onClose={() => setActiveModal(null)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
              {activeModal.replace('integration-', '').replace('securityhub', 'Security Hub')} Details
            </h2>
            <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span style={{ color: 'var(--color-success)' }}>Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Events</span>
              <span>Security event ingestion</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Environment</span>
              <span>Production</span>
            </div>
          </div>
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button onClick={() => setActiveModal(null)} className="settings-glass-btn">
              Close
            </button>
          </div>
        </ModalOverlay>
      )}

      {activeModal === 'webhook' && (
        <ModalOverlay onClose={() => setActiveModal(null)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Webhook Configuration</h2>
            <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Webhook URL</label>
              <input 
                type="text" 
                placeholder="https://..."
                value={settings.webhookUrl}
                onChange={e => updateSetting('webhookUrl', e.target.value)}
                className="settings-glass-input"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Enable Webhook</span>
              <ToggleSwitch checked={settings.webhookEnabled} onChange={c => updateSetting('webhookEnabled', c)} />
            </div>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setActiveModal(null)} className="settings-glass-btn" style={{ background: 'transparent' }}>
              Cancel
            </button>
            <button onClick={() => { setActiveModal(null); }} className="settings-btn-primary">
              Save Local State
            </button>
          </div>
        </ModalOverlay>
      )}

      {resetConfirm && (
        <ModalOverlay onClose={() => setResetConfirm(false)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-critical)' }}>
            <AlertTriangle size={24} />
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Reset Settings?</h2>
          </div>
          <p style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>
            This will restore SentinelFlow's default configuration.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setResetConfirm(false)} className="settings-glass-btn">
              Cancel
            </button>
            <button onClick={handleResetDefaults} className="settings-btn-primary" style={{ backgroundColor: 'var(--color-critical-bg)', borderColor: 'var(--color-critical)', color: 'var(--color-critical)' }}>
              Reset
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
