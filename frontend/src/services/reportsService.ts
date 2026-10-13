import api from './api';

export interface Report {
  id?: number;
  company_id: number;
  user_id: number;
  title?: string;        // Opcional por si el backend lo autogenera
  report_type: string;   // 'SALES', 'INVENTORY', 'PERSONAL'
  parameters?: Record<string, any>;
  file_url?: string;
  created_at?: string;
}

export const reportsService = {
  async getAll() {
    const response = await api.get('/reports');
    return response.data;
  },

  async create(data: Report) {
    const response = await api.post('/reports', data);
    return response.data;
  }
};