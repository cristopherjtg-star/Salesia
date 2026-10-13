import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el Token JWT en todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Recupera el token guardado en el navegador tras hacer login
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;