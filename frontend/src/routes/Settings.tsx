import React from 'react';
import { User, Shield, Key, BellRing } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>User Profile & Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account, preferences, and security configurations.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)' }}>
        {/* Profile Sidebar */}
        <div style={{ 
          backgroundColor: 'var(--bg-glass)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-tertiary)',
            border: '2px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={40} color="var(--text-muted)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Admin User</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>admin@nexus.net</p>
            <span style={{ 
              display: 'inline-block', 
              marginTop: '12px', 
              padding: '4px 12px', 
              backgroundColor: 'var(--color-critical-bg)', 
              color: 'var(--color-critical)', 
              border: '1px solid var(--color-critical)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>Super Admin</span>
          </div>
        </div>

        {/* Settings Form */}
        <div style={{ 
          backgroundColor: 'var(--bg-glass)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)'
        }}>
          
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} /> Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</label>
                <input type="text" defaultValue="Admin User" style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
                <input type="email" defaultValue="admin@nexus.net" style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-medium)' }}></div>

          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> Security
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure your account with an additional verification step.</div>
                </div>
                <button style={{ padding: '6px 12px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Enabled</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Password</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last changed 45 days ago.</div>
                </div>
                <button style={{ padding: '6px 12px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Change Password</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
