import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { API_BASE_URL } from '../api/client';

async function sendRealLoginTelemetry(email: string, eventType: 'login_success' | 'login_failed' = 'login_success') {
  return; // HACKATHON: Disable telemetry since the AWS endpoint is not built yet
  try {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/events/telemetry`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        user_id: email,
        resource: 'auth-service'
      }),
    });
  } catch (err) {
    // Non-blocking telemetry background dispatch warning
    console.warn('[Telemetry] Live event dispatch notice:', err);
  }
}

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const { isSignedIn } = await signIn({ username, password });
      if (isSignedIn) {
        // Dispatch real login_success telemetry (server extracts real IP and User-Agent)
        sendRealLoginTelemetry(username, 'login_success');
        return true;
      }
      return false;
    } catch (error) {
      sendRealLoginTelemetry(username, 'login_failed');
      console.error('Error signing in', error);
      throw error;
    }
  },

  register: async (username: string, password: string, fullName?: string) => {
    try {
      const nameAttribute = fullName || username.split('@')[0];
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username,
            name: nameAttribute,
          }
        }
      });
      return { isSignUpComplete, userId, nextStep };
    } catch (error) {
      console.error('Error signing up', error);
      throw error;
    }
  },

  confirmRegistration: async (username: string, code: string) => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username,
        confirmationCode: code
      });
      if (isSignUpComplete) {
        sendRealLoginTelemetry(username, 'login_success');
      }
      return isSignUpComplete;
    } catch (error) {
      console.error('Error confirming sign up', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  },

  isAuthenticated: async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens !== undefined;
    } catch {
      return false;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const user = await getCurrentUser();
      return user;
    } catch {
      return null;
    }
  }
};
