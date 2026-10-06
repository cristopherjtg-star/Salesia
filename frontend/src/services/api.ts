import axios, { type InternalAxiosRequestConfig } from 'axios';

// Si tu backend en FastAPI usa prefijo como /api o /api/v1, puedes incluirlo al final de la URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar automáticamente el token JWT en las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;