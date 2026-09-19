import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export const authService = {
  login: async (username: string, password: string, mfa?: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      
      // Note: If MFA is required, we would handle `nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_MFA'` here.
      // For this hackathon scope, we assume basic username/password flow is enabled.
      
      if (isSignedIn) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error signing in', error);
      throw error;
    }
  },

  register: async (username: string, password: string) => {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username,
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
