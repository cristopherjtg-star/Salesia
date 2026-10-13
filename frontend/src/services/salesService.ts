import api from './api';

export interface SaleItem {
  product_id: number;
  quantity: number;
}

export interface SalePayload {
  company_id: number;
  warehouse_id?: number; // <-- 1. Agregado al Payload de la venta
  customer_id: number;
  items: SaleItem[];
  payment_method: string;
  sale_code?: string;
}

export const saleService = {
  // Crear una nueva venta
  createSale: async (payload: SalePayload) => {
    const response = await api.post('/sales/', payload);
    return response.data;
  },

  // Obtener catálogo de productos filtrado por almacén/sede
  getProducts: async (warehouseId: number = 1) => { // <-- 2. Acepta warehouseId con default 1
    const response = await api.get(`/products/?warehouse_id=${warehouseId}`);
    return response.data;
  },

  // Obtener lista de clientes para asignar al ticket
  getCustomers: async () => {
    const response = await api.get('customers/');
    return response.data;
  }
};