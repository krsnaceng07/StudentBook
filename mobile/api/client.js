import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Auto-detect the machine's local IP from the Metro bundler host
const getHost = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname;
  }
  
  const host = Constants.expoConfig?.hostUri || 
               Constants.expoConfig?.debuggerHost || 
               'localhost:8081';
               
  return host.split(':')[0];
};

const DEV_IP = getHost();
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${DEV_IP}:5000/api/v1`;
export const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL 
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api/v1', '')
  : `http://${DEV_IP}:5000`;

console.log('[API Client] Initialized with Base URL:', API_URL);

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Dynamically inject the latest token from AuthStore
client.interceptors.request.use(
  (config) => {
    // We use require here to avoid circular dependency with AuthStore
    const { useAuthStore } = require('../store/authStore');
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
client.interceptors.response.use(
  (response) => {
    // console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const { useAuthStore } = require('../store/authStore');
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    
    // Silence 404 for /profile/me as it's expected for brand new users
    const isExpected404 = error.response?.status === 404 && error.config?.url?.includes('/profile/me');


    const status = error.response?.status;
    const isValidationError = status === 400 || status === 401 || status === 403;

    if (status === 401 && isAuthenticated && !error.config?.url?.includes('/auth/login')) {
      console.warn('[API Auth] Session expired or invalid. Triggering global logout.');
      await useAuthStore.getState().logout();
    }

    if (!isExpected404) {
      const url = error.config?.url || 'unknown url';
      const statusText = status || 'network error';
      
      // Distinguish between critical errors and user-level validation/auth feedback
      if (isValidationError) {
        console.warn(`[API Validation] ${statusText} - ${url}`);
      } else {
        console.error(`[API Error] ${statusText} - ${url}`);
      }
      
      if (error.response?.data) {
        const backendMessage = error.response.data?.message || error.response.data?.error;
        if (backendMessage) {
          if (isValidationError) {
            console.warn(`[API Suggestion]: ${backendMessage}`);
          } else {
            console.error(`[API Suggestion]: Backend says "${backendMessage}"`);
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
