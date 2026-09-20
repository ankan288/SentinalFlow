import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/common/Button';
import PortalFieldCollection from '../components/ui/portal-field';
import { authService } from '../services/auth/authService';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setLoading(true);

    try {
      const response = await authService.register(email, password);
      if (response.isSignUpComplete) {
        await authService.login(email, password);
        navigate('/dashboard');
      } else {
        setIsConfirming(true);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.confirmRegistration(email, verificationCode);
      // Auto login after confirmation
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Confirmation failed');
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
          <img src="/logo.png" alt="SentinelFlow Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: 'var(--space-3)' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '0.025em' }}>SentinelFlow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
            {isConfirming ? 'Verify your email' : 'Analyst Registration'}
          </p>
        </div>

        {!isConfirming ? (
          <>
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
                <label style={labelStyle}>Confirm Passphrase</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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

              <Button 
                type="submit" 
                variant="primary" 
                style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}
                disabled={loading}
              >
                <UserPlus size={18} />
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
            </form>
          </>
        ) : (
          <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
              We sent a 6-digit verification code to <strong>{email}</strong>.
            </p>
            <div>
              <label style={labelStyle}>Verification Code</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  style={{...inputStyle, paddingLeft: '40px', letterSpacing: '0.25em', fontFamily: 'var(--font-family-mono)', textAlign: 'center'}}
                  placeholder="000000"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}
              disabled={loading || verificationCode.length !== 6}
            >
              <Mail size={18} />
              {loading ? 'Verifying...' : 'Verify and Sign In'}
            </Button>
          </form>
        )}

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-action)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.05em' }}>
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
