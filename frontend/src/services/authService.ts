export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
  avatar_url?: string;
}

const ACTIVE_EMAIL_KEY = 'sentinelflow_active_user_email';
const PROFILE_PREFIX = 'sentinelflow_profile_';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getProfileKey(email?: string): string {
  const currentEmail = email || localStorage.getItem(ACTIVE_EMAIL_KEY) || 'user@sentinelflow.io';
  return `${PROFILE_PREFIX}${currentEmail.toLowerCase()}`;
}

function deriveNameFromEmail(email: string): string {
  const handle = email.split('@')[0] || 'User';
  return handle
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const authService = {
  setActiveUserEmail: (email: string) => {
    if (email) {
      localStorage.setItem(ACTIVE_EMAIL_KEY, email.toLowerCase());
    }
  },

  getActiveUserEmail: (): string | null => {
    return localStorage.getItem(ACTIVE_EMAIL_KEY);
  },

  getProfile: async (): Promise<UserProfile> => {
    await delay(100); // Lightweight async simulation
    const activeEmail = localStorage.getItem(ACTIVE_EMAIL_KEY) || 'analyst@sentinelflow.io';
    const key = getProfileKey(activeEmail);
    const storedStr = localStorage.getItem(key);

    if (storedStr) {
      try {
        const user = JSON.parse(storedStr);
        // Ensure email matches active email
        user.email = user.email || activeEmail;
        return user as UserProfile;
      } catch (e) {
        // Fall through to fallback
      }
    }

    // Default profile constructed specifically for the logged-in user
    const newUser: UserProfile = {
      id: `usr-${Math.floor(10000 + Math.random() * 90000)}`,
      name: deriveNameFromEmail(activeEmail),
      email: activeEmail,
      phone: '',
      organization: '',
      role: 'Senior Security Analyst',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      is_active: true,
    };

    localStorage.setItem(key, JSON.stringify(newUser));
    return newUser;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(200);
    const activeEmail = localStorage.getItem(ACTIVE_EMAIL_KEY) || 'analyst@sentinelflow.io';
    const key = getProfileKey(activeEmail);
    const storedStr = localStorage.getItem(key);

    let user: UserProfile = storedStr ? JSON.parse(storedStr) : await authService.getProfile();

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.organization !== undefined) user.organization = data.organization;
    if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url;

    localStorage.setItem(key, JSON.stringify(user));
    // Trigger window event so components can update reactively
    window.dispatchEvent(new CustomEvent('sentinelflow_profile_updated', { detail: user }));

    return user;
  },

  changePassword: async (currentPass: string, newPass: string): Promise<boolean> => {
    await delay(300);
    if (currentPass.length < 4) {
      throw new Error("Current password is incorrect.");
    }
    if (newPass.length < 8) {
      throw new Error("Password does not meet security requirements.");
    }
    return true;
  },

  recordLogin: async (email?: string, name?: string): Promise<void> => {
    const targetEmail = email || localStorage.getItem(ACTIVE_EMAIL_KEY) || 'analyst@sentinelflow.io';
    authService.setActiveUserEmail(targetEmail);
    
    const key = getProfileKey(targetEmail);
    const storedStr = localStorage.getItem(key);
    
    let user: UserProfile;
    if (storedStr) {
      user = JSON.parse(storedStr);
      if (name) user.name = name;
      user.last_login = new Date().toISOString();
    } else {
      user = {
        id: `usr-${Math.floor(10000 + Math.random() * 90000)}`,
        name: name || deriveNameFromEmail(targetEmail),
        email: targetEmail,
        phone: '',
        organization: '',
        role: 'Senior Security Analyst',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true,
      };
    }

    localStorage.setItem(key, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('sentinelflow_profile_updated', { detail: user }));
  },

  registerUser: async (name: string, email: string): Promise<void> => {
    const targetEmail = email.toLowerCase();
    authService.setActiveUserEmail(targetEmail);

    const newUser: UserProfile = {
      id: `usr-${Math.floor(10000 + Math.random() * 90000)}`,
      name: name || deriveNameFromEmail(targetEmail),
      email: targetEmail,
      phone: '',
      organization: '',
      role: 'Senior Security Analyst',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      is_active: true,
    };

    const key = getProfileKey(targetEmail);
    localStorage.setItem(key, JSON.stringify(newUser));
    window.dispatchEvent(new CustomEvent('sentinelflow_profile_updated', { detail: newUser }));
  }
};
