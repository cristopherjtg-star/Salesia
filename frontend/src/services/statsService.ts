import api from './api';

export interface CentralTendencyPayload {
  data: number[];
}

export const statsService = {
  getCentralTendency: async (payload: CentralTendencyPayload) => {
    // El backend exige la clave "values" según el Swagger
    const response = await api.post('/statistics/central-tendency', {
      values: payload.data
    });
    return response.data;
  },

  classifyVariable: async (payload: { data: number[] }) => {
    const response = await api.post('/statistics/classify-variable', {
      values: payload.data
    });
    return response.data;
  },

  getFrequency: async (payload: { data: number[] }) => {
    const response = await api.post('/statistics/frequency', {
      values: payload.data
    });
    return response.data;
  }
};