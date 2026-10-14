import axios from 'axios';

// Obtiene la URL base de las variables de entorno de Vite
const envUrl = import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com';

// Asegura que la URL termine siempre en /api/v1 para evitar errores 404
const API_URL = envUrl.endsWith('/api/v1') 
  ? envUrl 
  : `${envUrl.replace(/\/$/, '')}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token JWT automáticamente
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