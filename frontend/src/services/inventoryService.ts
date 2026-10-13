import api from './api';

export interface InventoryItem {
  id: number;           // ID del producto (Product.id)
  inventory_id: number; // ID del registro en la tabla inventory (Inventory.id)
  sku: string;
  name: string;
  stock: number;
  unit_price: number;
  category: string;
}

export interface KardexMovement {
  id: number;
  created_at: string;
  movement_type: 'ENTRADA' | 'SALIDA' | 'VENTA' | 'AJUSTE';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  warehouse_name?: string;
  user_name?: string;
}

export const inventoryService = {
  getInventory: async (warehouseId: number = 1): Promise<InventoryItem[]> => {
    const response = await api.get('/products/', {
      params: { warehouse_id: warehouseId }
    });

    const productsData = Array.isArray(response.data) 
      ? response.data 
      : response.data.items || response.data.data || [];

    return productsData.map((prod: any) => ({
      id: prod.id,
      inventory_id: prod.inventory_id ?? prod.inventory?.id ?? prod.id,
      sku: prod.sku || 'N/A',
      name: prod.name || 'Sin nombre',
      stock: Number(prod.current_stock ?? prod.stock ?? 0),
      unit_price: Number(prod.unit_price ?? prod.price ?? 0),
      category: prod.category || 'General',
    }));
  },

  updateStock: async (productId: number, warehouseId: number, quantity: number, type: 'IN' | 'OUT') => {
    const adjustedQuantity = type === 'OUT' ? -Math.abs(quantity) : Math.abs(quantity);

    const response = await api.post(`/inventory/adjust`, {
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: adjustedQuantity,
      movement_type: type === 'IN' ? 'ENTRADA' : 'SALIDA',
      reason: "Ajuste manual desde interfaz"
    });
    return response.data;
  },

  // CORREGIDO: Enviamos product_id para coincidir con la firma del Backend
  getKardex: async (productId: number, warehouseId: number): Promise<KardexMovement[]> => {
    const response = await api.get('/inventory/movements', {
      params: { product_id: productId, warehouse_id: warehouseId }
    });
    return Array.isArray(response.data) ? response.data : response.data.items || response.data.data || [];
  },

  deleteProduct: async (productId: number): Promise<any> => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
};