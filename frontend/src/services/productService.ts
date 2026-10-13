import api from './api';

export const productsService = {
  async getAll(warehouseId: number = 1) {
    const response = await api.get(`/products/?warehouse_id=${warehouseId}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/products/', data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};