import * as bcrypt from 'bcryptjs';

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
}

const STORAGE_KEY = 'sentinelflow_profile';

const DEFAULT_USER = {
  id: 'usr-10492',
  name: 'Jane Doe',
  email: 'analyst@acme.corp',
  phone: '+1 (555) 019-8372',
  organization: 'Acme Corporation',
  role: 'Senior Security Analyst',
  created_at: '2023-01-15T08:30:00Z',
  last_login: new Date().toISOString(),
  is_active: true,
  password_hash: bcrypt.hashSync('password123', 10), // mock initial password
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  getProfile: async (): Promise<UserProfile> => {
    await delay(600); // Simulate network request
    const storedStr = localStorage.getItem(STORAGE_KEY);
    let user = storedStr ? JSON.parse(storedStr) : DEFAULT_USER;
    
    if (!storedStr) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    }

    // Never return the password_hash to the frontend
    const { password_hash, ...safeProfile } = user;
    return safeProfile as UserProfile;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(800);
    const storedStr = localStorage.getItem(STORAGE_KEY);
    let user = storedStr ? JSON.parse(storedStr) : DEFAULT_USER;

    // Only allow updating safe fields
    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.organization) user.organization = data.organization;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    const { password_hash, ...safeProfile } = user;
    return safeProfile as UserProfile;
  },

  changePassword: async (currentPass: string, newPass: string): Promise<boolean> => {
    await delay(1000);
    const storedStr = localStorage.getItem(STORAGE_KEY);
    let user = storedStr ? JSON.parse(storedStr) : DEFAULT_USER;

    const isMatch = bcrypt.compareSync(currentPass, user.password_hash);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    // Basic password validation
    if (newPass.length < 8) {
      throw new Error("Password does not meet security requirements.");
    }

    // Hash new password and save
    user.password_hash = bcrypt.hashSync(newPass, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return true;
  }
};
