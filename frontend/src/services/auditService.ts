import api from './api';

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  table_name: string;
  details: Record<string, any> | null;
  created_at: string;
}

export const auditService = {
  async getLogs(): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>('/audit');
    return response.data;
  }
};