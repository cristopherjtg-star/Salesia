import api from './api';

export interface Employee {
  id?: number;
  company_id: number;
  user_id: number;
  position: string;      // Cargo / Posición (ej: "Administrador", "Almacén")
  hire_date?: string;    // Fecha de contratación
  is_active?: boolean;   // Estado (Activo / Inactivo)
}

export const sellersService = {
  // Obtener la lista de empleados / personal
  async getAll() {
    const response = await api.get('employees');
    return response.data;
  },

  // Registrar un nuevo empleado / personal
  async create(data: Employee) {
    const response = await api.post('/employees', data);
    return response.data;
  },

  // Actualizar datos de un empleado existente
  async update(id: number, data: Partial<Employee>) {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  // Desactivación lógica del personal (is_active = false)
  async deactivate(id: number) {
    const response = await api.patch(`/employees/${id}/deactivate`);
    return response.data;
  }
};