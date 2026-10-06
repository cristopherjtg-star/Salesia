import axios, { type InternalAxiosRequestConfig } from 'axios';

// Agregamos /api/v1 a la URL base
const BASE_URL = import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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