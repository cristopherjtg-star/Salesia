import api from './api';

export const productsService = {
  async getAll(warehouseId: number = 1) {
    // ✅ CORRECTO: Sin barra inicial y usando params de Axios
    const response = await api.get('products', {
      params: { warehouse_id: warehouseId }
    });
    return response.data;
  },

  async create(data: any) {
    // ✅ CORRECTO: Sin barra inicial
    const response = await api.post('products', data);
    return response.data;
  },

  async update(id: number, data: any) {
    // ✅ CORRECTO: Sin barra inicial
    const response = await api.put(`products/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    // ✅ CORRECTO: Sin barra inicial
    const response = await api.delete(`products/${id}`);
    return response.data;
  }
};