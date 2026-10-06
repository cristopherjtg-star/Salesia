import api from './api';

export interface Customer {
  id: number;
  name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  address: string; // Debe coincidir con el campo address que devuelve el backend
}

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  },

  createCustomer: async (payload: Omit<Customer, 'id'>) => {
    const response = await api.post('/customers/', payload);
    return response.data;
  }
};