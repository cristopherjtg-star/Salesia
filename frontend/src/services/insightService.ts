import api from './api';

export interface Insight {
  id: number;
  code: string;
  title: string;
  description: string;
  impact_level: string;
  evidence_data?: any;
  created_at: string;
}

export const insightService = {
  getInsights: async (): Promise<Insight[]> => {
    const response = await api.get('/insights/');
    return response.data;
  },
};