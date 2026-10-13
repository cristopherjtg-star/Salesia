import axios from 'axios';

// Configuración centralizada para conectar el Frontend con tu Backend en Render
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para enviar automáticamente el token de autenticación en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // O la llave donde guardes tu token al iniciar sesión
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;