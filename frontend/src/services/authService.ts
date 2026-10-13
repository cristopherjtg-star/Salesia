import api from './api'; // Importa tu instancia centralizada

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
      // Usa 'api' en lugar de 'axios' para aprovechar la baseURL y los interceptores
      const response = await api.post<AuthResponse>('auth/login', credentials);
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error: any) {
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