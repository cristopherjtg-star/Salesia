import api from './api';

export const warehouseService = {
  // Obtener todos los almacenes o filtrar por ID correctamente
  getWarehouse: async (warehouseId?: number) => {
    try {
      // Usamos el objeto 'params' para que Axios construya bien los parámetros URL (?id=1)
      const response = await api.get('/warehouse', {
        params: warehouseId ? { id: warehouseId } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error('Error al cargar productos del backend:', error);
      throw error;
    }
  },
};