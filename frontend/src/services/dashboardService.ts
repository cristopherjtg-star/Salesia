import api from './api';

export interface DashboardSummary {
  total_revenue: number;
  total_sales: number;
  active_customers: number;
  ticket_promedio: number;
  mean_sale: number;
  median_sale: number;
  recent_insights: Array<{
    id: number;
    title: string;
    description: string;
    created_at: string;
  }>;
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  }
};