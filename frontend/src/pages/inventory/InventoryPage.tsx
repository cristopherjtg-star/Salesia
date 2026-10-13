import React, { useEffect, useState } from 'react';
import { inventoryService, type InventoryItem, type KardexMovement } from '../../services/inventoryService';
import api from '../../services/api';
import { 
  Package, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Building2, 
  DollarSign, 
  Boxes, 
  Layers,
  History
} from 'lucide-react';

interface Warehouse {
  id: number;
  name: string;
  code?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [modalType, setModalType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Estados para almacenes/sedes
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1);

  // Estados para Modal de Kardex
  const [kardexProduct, setKardexProduct] = useState<InventoryItem | null>(null);
  const [kardexLogs, setKardexLogs] = useState<KardexMovement[]>([]);
  const [loadingKardex, setLoadingKardex] = useState(false);

  // 1. Cargar lista de almacenes
  const loadWarehouses = async () => {
    try {
      const response = await api.get('warehouses/');
      const list = Array.isArray(response.data) ? response.data : response.data.data;
      if (Array.isArray(list) && list.length > 0) {
        setWarehouses(list);
        setSelectedWarehouseId((prev) => prev || list[0].id);
      }
    } catch (error) {
      console.error("Error al cargar almacenes:", error);
    }
  };

  // 2. Cargar existencias según la sede activa
  const fetchInventory = async (warehouseId?: number) => {
    try {
      setLoading(true);
      const targetWarehouseId = warehouseId ?? selectedWarehouseId;
      const data = await inventoryService.getInventory(targetWarehouseId);
      setItems(data);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchInventory(selectedWarehouseId);
    }
  }, [selectedWarehouseId]);

  // AJUSTE CLAVE 1: Usamos product_id + warehouse_id para el ajuste desacoplado
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await inventoryService.updateStock(
        selectedProduct.id, 
        selectedWarehouseId, 
        Number(quantity), 
        modalType
      );
      setSelectedProduct(null);
      setQuantity(1);
      await fetchInventory(selectedWarehouseId);
    } catch (error: any) {
      console.error("Error al actualizar stock:", error);
      const detail = error.response?.data?.detail || "Error al procesar el movimiento de inventario";
      alert(detail);
    } finally {
      setSubmitting(false);
    }
  };

  // AJUSTE CLAVE 2: Consulta de Kardex por product_id y warehouse_id
  const handleOpenKardex = async (item: InventoryItem) => {
  setKardexProduct(item);
  try {
    setLoadingKardex(true);
    // Cambiamos item.inventory_id por item.id (product_id)
    const logs = await inventoryService.getKardex(item.id, selectedWarehouseId);
    setKardexLogs(logs);
  } catch (error) {
    console.error("Error al cargar Kardex:", error);
  } finally {
    setLoadingKardex(false);
  }
};

  const handleDeleteProduct = async (item: InventoryItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${item.name}"? Esta acción quedará registrada en la auditoría.`)) {
      return;
    }

    try {
      await inventoryService.deleteProduct(item.id);
      await fetchInventory(selectedWarehouseId);
    } catch (error: any) {
      console.error("Error al eliminar producto:", error);
      const detail = error.response?.data?.detail || "Error al eliminar el producto";
      alert(detail);
    }
  };

  // --- CÁLCULO DE MÉTRICAS (KPIs) ---
  const totalValue = items.reduce((acc, item) => acc + (Number(item.unit_price) * Number(item.stock)), 0);
  const totalUnits = items.reduce((acc, item) => acc + Number(item.stock), 0);
  const lowStockCount = items.filter((item) => Number(item.stock) <= 5).length;
  const currentWarehouseName = warehouses.find(w => w.id === selectedWarehouseId)?.name || 'Almacén Principal';

  return (
    <div className="space-y-6">
      {/* Encabezado Principal con Selector de Sede */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-salesia-cyan" /> Inventario & Kardex
          </h1>
          <p className="text-slate-400 text-sm mt-1">Control de existencias y trazabilidad de almacén en tiempo real</p>
        </div>

        {/* SELECTOR DINÁMICO DE SEDES */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs shadow-lg">
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-slate-400 font-medium">Sede Activa:</span>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
          >
            {warehouses.length > 0 ? (
              warehouses.map((w) => (
                <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                  {w.name}
                </option>
              ))
            ) : (
              <option value={1} className="bg-slate-900 text-white">
                Almacén Principal - Lima
              </option>
            )}
          </select>
        </div>
      </div>

      {/* TARJETAS KPI (METRICAS EN TIEMPO REAL POR SEDE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-medium">Valor del Inventario</p>
            <h3 className="text-xl font-bold text-white font-mono mt-1">
              S/ {totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-emerald-400 mt-1 inline-block">Valorización comercial</span>
          </div>
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Unidades</p>
            <h3 className="text-xl font-bold text-white font-mono mt-1">
              {totalUnits} <span className="text-xs text-slate-400 font-normal">unids.</span>
            </h3>
            <span className="text-[10px] text-slate-400 mt-1 inline-block">Existencias físicas globales</span>
          </div>
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-medium">Alertas Stock Bajo</p>
            <h3 className={`text-xl font-bold font-mono mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {lowStockCount} <span className="text-xs text-slate-400 font-normal">ítems</span>
            </h3>
            <span className="text-[10px] text-amber-400/80 mt-1 inline-block">Stock $\le$ 5 unidades</span>
          </div>
          <div className={`p-3 rounded-xl border ${lowStockCount > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Catálogo</p>
            <h3 className="text-xl font-bold text-white font-mono mt-1">
              {items.length} <span className="text-xs text-slate-400 font-normal">productos</span>
            </h3>
            <span className="text-[10px] text-blue-400 truncate max-w-[130px] block mt-1">
              {currentWarehouseName}
            </span>
          </div>
          <div className="p-3 bg-cyan-600/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h2 className="font-semibold text-slate-200">Listado General de Almacén</h2>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
            Total items: {items.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando existencias del almacén...</div>
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
                      <td className="px-6 py-4 text-salesia-cyan font-semibold">S/ {Number(item.unit_price).toFixed(2)}</td>
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
                          onClick={() => handleOpenKardex(item)}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Ver trazabilidad Kardex"
                        >
                          <History size={14} /> Kardex
                        </button>
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

      {/* MODAL DE TRAZABILIDAD KARDEX */}
      {kardexProduct && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="text-blue-400" size={18} />
                  Kardex Valorizado: {kardexProduct.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  SKU: <span className="font-mono text-slate-300">{kardexProduct.sku}</span> | Sede: <span className="text-cyan-400 font-semibold">{currentWarehouseName}</span>
                </p>
              </div>
              <button 
                onClick={() => setKardexProduct(null)} 
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            {loadingKardex ? (
              <div className="p-8 text-center text-slate-400">Cargando movimientos contables...</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/40">
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Operación</th>
                      <th className="p-2.5">Concepto / Referencia</th>
                      <th className="p-2.5 text-right">Cant.</th>
                      <th className="p-2.5 text-right">Stock Anterior</th>
                      <th className="p-2.5 text-right">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {kardexLogs.length > 0 ? (
                      kardexLogs.map((log) => {
                        const isPositive = log.quantity > 0;
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/30">
                            <td className="p-2.5 text-slate-400">
                              {new Date(log.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.movement_type === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                log.movement_type === 'VENTA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {log.movement_type}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-300 font-sans">{log.reason || 'Movimiento de inventario'}</td>
                            <td className={`p-2.5 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? `+${log.quantity}` : log.quantity}
                            </td>
                            <td className="p-2.5 text-right text-slate-400">{log.previous_stock}</td>
                            <td className="p-2.5 text-right text-white font-bold">{log.new_stock}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                          No hay registros de movimientos previos para este producto en la sede activa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setKardexProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}

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