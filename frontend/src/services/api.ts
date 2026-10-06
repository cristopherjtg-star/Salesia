import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  // Utiliza la variable de entorno de Vite o la URL de Render por defecto
  baseURL: import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com',
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