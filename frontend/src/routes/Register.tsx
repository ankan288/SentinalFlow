import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus } from 'lucide-react';
import { Button } from '../components/common/Button';
import PortalFieldCollection from '../components/ui/portal-field';
import { authService } from '../services/auth/authService';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setLoading(true);

    try {
      await authService.register(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#020202',
      color: 'var(--text-primary)',
      padding: 'var(--space-4)',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <PortalFieldCollection
          speed={1}
          size={1}
          length={1}
          density={1}
          opacity={1}
          hue={0}
          saturation={1}
          brightness={1}
        />
      </div>
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ 
            color: 'var(--color-success)', 
            marginBottom: 'var(--space-4)',
            backgroundColor: 'var(--color-success-bg)',
            padding: 'var(--space-3)',
            borderRadius: '50%'
          }}>
            <Shield size={32} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '0.025em' }}>SentinelFlow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>Analyst Registration</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label style={labelStyle}>Analyst ID (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="analyst@acme.corp"
            />
          </div>

          <div>
            <label style={labelStyle}>Passphrase</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••••••"
            />
          </div>
          
          <div>
            <label style={labelStyle}>Confirm Passphrase</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••••••"
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </form>

      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 'var(--space-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3)',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-medium)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box'
};
