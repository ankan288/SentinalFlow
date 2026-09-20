import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const { isSignedIn } = await signIn({ username, password });
      return isSignedIn;
    } catch (error) {
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
