import api from './api';

export interface SaleItem {
  product_id: number;
  quantity: number;
}

export interface SalePayload {
  company_id: number;
  customer_id: number;
  sale_code: string;
  items: SaleItem[];
  payment_method: string;
}

export const saleService = {
  createSale: async (payload: SalePayload) => {
    const response = await api.post('/sales/', payload);
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/products/');
    return response.data;
  }
};