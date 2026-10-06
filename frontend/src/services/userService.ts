import api from './api';

export interface User {
  id: number;
  company_id: number;
  role_id: number;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreatePayload {
  // Nota: company_id opcional o manejado por el backend desde el token del admin
  company_id?: number; 
  role_id: number;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const userService = {
  // Obtener lista de usuarios
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  // Crear un nuevo usuario apuntando a /users/
  createUser: async (payload: UserCreatePayload): Promise<User> => {
    const response = await api.post('/users/', payload);
    return response.data;
  },

  // Alias para mantener compatibilidad con el componente UserPage que busca registerUser
  registerUser: async (payload: UserCreatePayload): Promise<User> => {
    return userService.createUser(payload);
  }
};