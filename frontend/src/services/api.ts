import axios from 'axios';

const api = axios.create({
  // Asegúrate de que termine en .com/api/v1 (NO .s)
  baseURL: import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;