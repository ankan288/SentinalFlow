

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
  last_login: '',
  is_active: true,
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

    return user as UserProfile;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(800);
    const storedStr = localStorage.getItem(STORAGE_KEY);
    let user = storedStr ? JSON.parse(storedStr) : DEFAULT_USER;

    // Only allow updating safe fields
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.organization !== undefined) user.organization = data.organization;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return user as UserProfile;
  },

  changePassword: async (currentPass: string, newPass: string): Promise<boolean> => {
    await delay(1000);
    
    // Simulate current password validation purely by length to be somewhat realistic without local hashing
    if (currentPass.length < 4) {
      throw new Error("Current password is incorrect.");
    }

    // Basic password validation
    if (newPass.length < 8) {
      throw new Error("Password does not meet security requirements.");
    }

    // Since we don't store passwords on the client, we just return true.
    return true;
  },

  recordLogin: async (): Promise<void> => {
    const storedStr = localStorage.getItem(STORAGE_KEY);
    let user = storedStr ? JSON.parse(storedStr) : { ...DEFAULT_USER };
    
    user.last_login = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  registerUser: async (name: string, email: string): Promise<void> => {
    const newUser = {
      ...DEFAULT_USER,
      id: `usr-${Math.floor(Math.random() * 100000)}`,
      name,
      email,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  }
};
