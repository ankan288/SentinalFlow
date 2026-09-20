import { fetchAuthSession } from 'aws-amplify/auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zxcqppde45.execute-api.us-east-1.amazonaws.com/Prod';

export class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      return { 'Authorization': token }; // AWS API Gateway Cognito Authorizer expects raw token
    }
  } catch (error) {
    console.warn('Failed to fetch auth session:', error);
  }
  return {};
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const authHeaders = await getAuthHeaders();
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
      });

      if (!response.ok) {
        throw new ApiError(response.status, `API GET Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  async post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const authHeaders = await getAuthHeaders();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new ApiError(response.status, `API POST Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }
};
