import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/common/Button';
import PortalFieldCollection from '../components/ui/portal-field';
import { authService } from '../services/auth/authService';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfa, setMfa] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // If already logged in, redirect immediately
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Login failed');
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
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <img src="/logo.png" alt="SentinelFlow Logo" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: 'var(--space-4)' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '0.025em' }}>SentinelFlow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>Secure Operations Center</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={labelStyle}>Analyst ID (Email)</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={inputStyle}
              placeholder="analyst@acme.corp"
            />
          </div>

          <div>
            <label style={labelStyle}>Passphrase</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '0.75rem', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>MFA Token (Authenticator)</label>
            <input 
              type="text" 
              value={mfa}
              onChange={e => setMfa(e.target.value)}
              required
              style={{...inputStyle, letterSpacing: '0.25em', fontFamily: 'var(--font-family-mono)'}}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}
            disabled={loading}
          >
            <Lock size={18} />
            {loading ? 'Authenticating...' : 'Establish Secure Connection'}
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-action)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.05em' }}>
            CLICK HERE
          </Link>
        </div>

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
