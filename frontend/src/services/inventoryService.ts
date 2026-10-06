import api from './api';

export interface InventoryItem {
  id: number;           // ID del producto
  inventory_id: number; // ID del registro en la tabla inventory
  sku: string;
  name: string;
  stock: number;
  unit_price: number;
  category: string;
}

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    // 1. Cargar lista de productos
    const productsRes = await api.get('/products/');
    const productsData = Array.isArray(productsRes.data) 
      ? productsRes.data 
      : productsRes.data.items || [];

    // 2. Cargar tabla inventory
    let inventoryMap: Record<number, { inventory_id: number; stock: number }> = {};
    try {
      const invRes = await api.get('/inventory/');
      const invData = Array.isArray(invRes.data) ? invRes.data : invRes.data.items || [];
      
      invData.forEach((item: any) => {
        if (item.product_id !== undefined) {
          inventoryMap[item.product_id] = {
            inventory_id: item.id,
            stock: Number(item.current_stock ?? 0)
          };
        }
      });
    } catch (e) {
      console.warn("Error al cargar /inventory/:", e);
    }

    // 3. Unificar información
    return productsData.map((prod: any) => {
      const invInfo = inventoryMap[prod.id];
      return {
        id: prod.id,
        inventory_id: invInfo?.inventory_id ?? prod.inventory_id ?? prod.id,
        sku: prod.sku || 'N/A',
        name: prod.name || 'Sin nombre',
        stock: invInfo?.stock ?? Number(prod.current_stock ?? prod.stock ?? 0),
        unit_price: Number(prod.unit_price ?? prod.price ?? 0),
        category: prod.category || 'General',
      };
    });
  },

  updateStock: async (inventoryId: number, quantity: number, type: 'IN' | 'OUT') => {
    // Convertir a negativo si es una salida
    const adjustedQuantity = type === 'OUT' ? -Math.abs(quantity) : Math.abs(quantity);

    const response = await api.post(`/inventory/adjust`, {
      inventory_id: inventoryId,
      quantity: adjustedQuantity,
      movement_type: type === 'IN' ? 'ENTRADA' : 'SALIDA',
      reason: "Ajuste manual desde interfaz"
    });
    return response.data;
  },

  deleteProduct: async (productId: number): Promise<any> => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
};