import axios from 'axios';
import { useAuditStore } from '@/store/audit-store';

const api = axios.create({
  baseURL: 'http://localhost:8082'
});

// Add a request interceptor to automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get the token from Zustand store
    const token = useAuditStore.getState().token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
