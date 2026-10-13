import api from './api';

export interface Warehouse {
  id?: number;
  company_id: number;
  code: string;
  name: string;
  address?: string;
  is_active?: boolean;
}

export const warehousesService = {
  // 1. Obtener la lista de almacenes / sedes
  async getAll() {
    const response = await api.get('/branches');
    return response.data;
  },

  // 2. Registrar un nuevo almacén
  async create(data: Warehouse) {
    const response = await api.post('/branches', data);
    return response.data;
  },

  // 3. Actualizar datos de un almacén existente
  async update(id: number, data: Partial<Warehouse>) {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },

  // 4. Desactivación lógica (Baja lógica - is_active = false)
  async deactivate(id: number) {
    const response = await api.patch(`/branches/${id}/deactivate`);
    return response.data;
  }
};