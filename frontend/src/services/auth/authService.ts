// Mock Authentication Service for SentinelFlow
// Simulates server-side verification and token issuance

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const authService = {
  login: async (username: string, password: string, mfa?: string) => {
    await delay(1200); // Simulate network latency

    // Check against mock database
    const storedUsers = JSON.parse(localStorage.getItem('sentinel_users') || '{}');
    
    // Add default admin if not exists
    if (!storedUsers['admin@acme.corp']) {
      storedUsers['admin@acme.corp'] = { password: 'password123' };
    }

    const user = storedUsers[username];
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    if (mfa && mfa.length < 6) {
      throw new Error('Invalid MFA token');
    }

    // Mint a specific token based on the user
    const token = `token-${btoa(username)}-${Date.now()}`;
    localStorage.setItem('sentinel_auth', token);
    return token;
  },

  register: async (username: string, password: string) => {
    await delay(1200);

    const storedUsers = JSON.parse(localStorage.getItem('sentinel_users') || '{}');
    
    if (storedUsers[username]) {
      throw new Error('User already exists');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Save user
    storedUsers[username] = { password };
    localStorage.setItem('sentinel_users', JSON.stringify(storedUsers));

    // Authenticate immediately after registration
    const token = `token-${btoa(username)}-${Date.now()}`;
    localStorage.setItem('sentinel_auth', token);
    return token;
  },

  logout: () => {
    localStorage.removeItem('sentinel_auth');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('sentinel_auth');
    return token && token.startsWith('token-');
  }
};
