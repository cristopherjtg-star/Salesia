import api from './api';

export interface BayesPayload {
  prior: number;
  likelihood: number;
  marginal: number;
  hypothesis_description?: string;
  evidence_description?: string;
}

export const bayesService = {
  // 1. Cálculo Manual / Simulación
  calculate: async (data: BayesPayload) => {
    const response = await api.post('/bayes/calculate', data);
    return response.data;
  },

  // 2. Extrae métricas reales desde Supabase y calcula automáticamente
  getSmartScenario: async (scenario: 'conversion' | 'churn') => {
    const response = await api.get(`/bayes/erp-smart-scenario?scenario=${scenario}`);
    return response.data;
  },
};