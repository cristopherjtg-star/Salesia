import React, { useEffect, useState } from 'react';
import { inventoryService, type InventoryItem } from '../../services/inventoryService';
import { Package, PlusCircle, MinusCircle, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [modalType, setModalType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await inventoryService.updateStock(selectedProduct.inventory_id, Number(quantity), modalType);
      setSelectedProduct(null);
      setQuantity(1);
      await fetchInventory();
    } catch (error: any) {
      console.error("Error al actualizar stock:", error);
      const detail = error.response?.data?.detail || "Error al procesar el movimiento de inventario";
      alert(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (item: InventoryItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${item.name}"? Esta acción quedará registrada en la auditoría.`)) {
      return;
    }

    try {
      await inventoryService.deleteProduct(item.id);
      await fetchInventory();
    } catch (error: any) {
      console.error("Error al eliminar producto:", error);
      const detail = error.response?.data?.detail || "Error al eliminar el producto";
      alert(detail);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-salesia-cyan" /> Inventario & Kardex
        </h1>
        <p className="text-slate-400 text-sm mt-1">Control de existencias y trazabilidad de almacén en tiempo real</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h2 className="font-semibold text-slate-200">Listado General de Almacén</h2>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">Total items: {items.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando existencias...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase bg-slate-950/30">
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio Unitario</th>
                  <th className="px-6 py-4">Stock Actual</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {items.map((item) => {
                  const isLowStock = item.stock <= 5;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.sku}</td>
                      <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                      <td className="px-6 py-4 text-slate-400">{item.category}</td>
                      <td className="px-6 py-4 text-salesia-cyan font-semibold">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-white">{item.stock} unids.</td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertTriangle size={12} /> Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Óptimo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedProduct(item); setModalType('IN'); }}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Registrar Entrada"
                        >
                          <PlusCircle size={14} /> Entrada
                        </button>
                        <button
                          onClick={() => { setSelectedProduct(item); setModalType('OUT'); }}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Registrar Salida"
                        >
                          <MinusCircle size={14} /> Salida
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item)}
                          className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Ajuste de Stock */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">
                {modalType === 'IN' ? 'Registrar Entrada de Stock' : 'Registrar Salida de Stock'}
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {selectedProduct.name} <span className="text-slate-500 font-mono text-xs">(SKU: {selectedProduct.sku})</span>
              </p>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cantidad a modificar</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-salesia-cyan"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                    modalType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {submitting ? 'Guardando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}