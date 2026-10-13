import axios from 'axios';

// Detecta automáticamente la URL del backend (usando variable de entorno o la URL directa de Render)
const API_URL = import.meta.env.VITE_API_URL || 'https://salesia-1flh.onrender.com/api/v1';

export interface LoginCredentials {
  dni: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  dni: string;
  full_name: string;
  role: string;
  permissions: string[];
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
      
      // Opcional pero recomendado: guardar el token automáticamente en el almacenamiento local
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error: any) {
      // Extrae el mensaje de error personalizado del backend si existe (ej. "DNI o contraseña incorrectos")
      const message = error.response?.data?.detail || 'Error al iniciar sesión con el servidor.';
      throw new Error(message);
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};