import axios from 'axios';

// Asegúrate de que incluya /api/v1 al final si usa la ruta por defecto
const API_URL = import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;