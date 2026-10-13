import api from './api';

export interface CentralTendencyPayload {
  data: number[];
}

export const statsService = {
  // Espera { values: [...] } según NumericDataPayload
  getCentralTendency: async (payload: CentralTendencyPayload) => {
    const response = await api.post('/statistics/central-tendency', {
      values: payload.data
    });
    return response.data;
  },

  // Espera { data: [...] } según GeneralDataPayload
  classifyVariable: async (payload: { data: any[] }) => {
    const response = await api.post('/statistics/classify-variable', {
      data: payload.data
    });
    return response.data;
  },

  // Espera { data: [...] } según GeneralDataPayload
  getFrequency: async (payload: { data: any[] }) => {
    const response = await api.post('/statistics/frequency', {
      data: payload.data
    });
    return response.data;
  },

  // Opcional: Si implementaste el endpoint automático de ventas de la BD
  getEnterpriseSalesAnalysis: async (warehouseId: number = 1) => {
    const response = await api.get(`/statistics/enterprise/sales-analysis?warehouse_id=${warehouseId}`);
    return response.data;
  }
};