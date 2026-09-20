import React, { useState, useEffect, useRef } from 'react';
import { Shield, User, Mail, Phone, Building, Briefcase, Calendar, Clock, Key, AlertCircle, CheckCircle2, Camera, X, Check } from 'lucide-react';
import { authService, type UserProfile } from '../services/authService';
import { Button } from '../components/common/Button';
import { getInitials } from '../utils/avatarUtils';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    organization: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      } else {
        loadProfile();
      }
    };

    window.addEventListener('sentinelflow_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('sentinelflow_profile_updated', handleProfileUpdate);
    };
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setEditForm({
        name: data.name || '',
        phone: data.phone || '',
        organization: data.organization || ''
      });
    } catch (err) {
      setError('Unable to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const updated = await authService.updateProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPassError(null);
    setPassSuccess(null);

    if (passForm.new !== passForm.confirm) {
      setPassError('New passwords do not match.');
      return;
    }
    
    setPassLoading(true);
    try {
      await authService.changePassword(passForm.current, passForm.new);
      setPassSuccess('Password updated successfully.');
      setIsChangingPassword(false);
      setPassForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPassSuccess(null), 3000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Avatar Upload Handlers
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarPreview(base64);
      setIsAvatarModalOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleConfirmAvatar = async () => {
    if (!avatarPreview) return;
    setUploadLoading(true);
    try {
      const updated = await authService.updateProfile({ avatar_url: avatarPreview });
      setProfile(updated);
      setIsAvatarModalOpen(false);
      setAvatarPreview(null);
    } catch (err) {
      alert('Failed to save avatar image.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelAvatar = () => {
    setIsAvatarModalOpen(false);
    setAvatarPreview(null);
  };

  // Safe Date Formatters
  const formatDate = (dateStr?: string) => {
    if (!dateStr || !dateStr.trim()) return 'Jan 15, 2026';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Jan 15, 2026';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr || !dateStr.trim()) return 'Just now';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: 'var(--space-6)', color: 'var(--color-critical)' }}>
        {error || 'Profile not found.'}
      </div>
    );
  }

  const initials = getInitials(profile.name);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Hidden File Input for Avatar */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>My Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Manage your account and security settings</p>
        </div>
      </div>

      {passSuccess && (
        <div style={{
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          border: '1px solid var(--color-success)'
        }}>
          <CheckCircle2 size={20} />
          {passSuccess}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Profile Header Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              
              {/* Avatar Circle with Camera Overlay */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-medium)',
                  overflow: 'hidden',
                  userSelect: 'none'
                }}>
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Camera Icon Overlay Badge */}
                <button
                  onClick={handleCameraClick}
                  title="Upload profile picture"
                  aria-label="Upload profile picture"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary, #3b82f6)',
                    color: '#ffffff',
                    border: '2px solid var(--bg-secondary, #0f172a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                    transition: 'transform 0.15s, backgroundColor 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
                >
                  <Camera size={12} />
                </button>
              </div>

              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{profile.name}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>{profile.email}</div>
                <div style={{ 
                  display: 'inline-block',
                  backgroundColor: 'var(--color-primary-bg)',
                  color: 'var(--color-primary)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginTop: '6px'
                }}>
                  {profile.role}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div style={cardStyle}>
            <h3 style={sectionHeaderStyle}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={infoRowStyle}>
                <div style={infoLabelStyle}><Calendar size={14} /> Created At</div>
                <div style={infoValueStyle}>{formatDate(profile.created_at)}</div>
              </div>
              <div style={infoRowStyle}>
                <div style={infoLabelStyle}><Clock size={14} /> Last Login</div>
                <div style={infoValueStyle}>{formatTimestamp(profile.last_login)}</div>
              </div>
              <div style={infoRowStyle}>
                <div style={infoLabelStyle}><Shield size={14} /> Status</div>
                <div style={{...infoValueStyle, color: profile.is_active ? 'var(--color-success)' : 'var(--text-muted)'}}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Personal Information */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{...sectionHeaderStyle, margin: 0}}>Personal Information</h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-action)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input style={inputStyle} placeholder="Add your phone number" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Organization</label>
                  <input style={inputStyle} placeholder="Add your organization" value={editForm.organization} onChange={e => setEditForm({...editForm, organization: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <Button variant="primary" onClick={handleSaveProfile} disabled={saveLoading}>
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: profile.name, phone: profile.phone || '', organization: profile.organization || '' });
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}><User size={14} /> Full Name</div>
                  <div style={infoValueStyle}>{profile.name}</div>
                </div>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}><Mail size={14} /> Email Address</div>
                  <div style={infoValueStyle}>{profile.email}</div>
                </div>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}><Phone size={14} /> Phone Number</div>
                  <div style={infoValueStyle}>
                    {profile.phone ? (
                      profile.phone
                    ) : (
                      <button 
                        onClick={() => setIsEditing(true)}
                        style={addDetailsButtonStyle}
                      >
                        Add your details
                      </button>
                    )}
                  </div>
                </div>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}><Building size={14} /> Organization</div>
                  <div style={infoValueStyle}>
                    {profile.organization ? (
                      profile.organization
                    ) : (
                      <button 
                        onClick={() => setIsEditing(true)}
                        style={addDetailsButtonStyle}
                      >
                        Add your details
                      </button>
                    )}
                  </div>
                </div>
                <div style={infoRowStyle}>
                  <div style={infoLabelStyle}><Briefcase size={14} /> Role</div>
                  <div style={infoValueStyle}>{profile.role}</div>
                </div>
              </div>
            )}
          </div>

          {/* Security */}
          <div style={cardStyle}>
            <h3 style={sectionHeaderStyle}>Security</h3>
            
            <div style={infoRowStyle}>
              <div style={infoLabelStyle}><Key size={14} /> Password</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, justifyContent: 'space-between' }}>
                <div style={infoValueStyle}>••••••••••••••••</div>
                {!isChangingPassword && (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>

            {isChangingPassword && (
              <div style={{ 
                marginTop: 'var(--space-4)', 
                padding: 'var(--space-4)', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)'
              }}>
                <h4 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Change Password</h4>
                
                {passError && (
                  <div style={{ color: 'var(--color-critical)', fontSize: '0.875rem', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} /> {passError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <input type="password" style={inputStyle} value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" style={inputStyle} value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input type="password" style={inputStyle} value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <Button variant="primary" onClick={handleUpdatePassword} disabled={passLoading}>
                      {passLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setIsChangingPassword(false);
                      setPassForm({ current: '', new: '', confirm: '' });
                      setPassError(null);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Avatar Confirm Modal */}
      {isAvatarModalOpen && avatarPreview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: 'var(--bg-secondary, #0f172a)',
            border: '1px solid var(--border-medium, rgba(120, 150, 190, 0.2))',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: 'var(--space-6)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Update Profile Picture</h3>
              <button 
                onClick={handleCancelAvatar}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid var(--color-primary, #3b82f6)',
              marginBottom: 'var(--space-6)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
            }}>
              <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: '0 0 var(--space-6) 0' }}>
              Confirm your new avatar picture. It will be saved to your profile identity.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%' }}>
              <Button 
                variant="primary" 
                onClick={handleConfirmAvatar} 
                disabled={uploadLoading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Check size={16} /> {uploadLoading ? 'Saving...' : 'Confirm'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleCancelAvatar}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Styles
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.45)', // match glassmorphism
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(120, 150, 190, 0.2)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: '0 0 var(--space-4) 0'
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  paddingBottom: 'var(--space-3)',
  borderBottom: '1px solid var(--border-medium)',
  minHeight: '32px'
};

const infoLabelStyle: React.CSSProperties = {
  flex: '0 0 160px',
  color: 'var(--text-secondary)',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const infoValueStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  fontWeight: 500
};

const addDetailsButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-action, #60a5fa)',
  fontSize: '0.875rem',
  fontWeight: 500,
  textDecoration: 'underline',
  cursor: 'pointer',
  padding: 0
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-medium)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box'
};
