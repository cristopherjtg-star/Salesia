import api from './api';

export interface BayesPayload {
  prior: number;
  likelihood: number;
  marginal: number;
  hypothesis_description?: string;
  evidence_description?: string;
}

export const bayesService = {
  calculate: async (data: BayesPayload) => {
    const response = await api.post('/bayes/calculate', data);
    return response.data;
  },
};