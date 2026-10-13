import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { saleService } from '../../services/salesService';
import { customerService } from '../../services/customerService';
import api from '../../services/api';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  Receipt, 
  CheckCircle,
  Building2,
  Package,
  Loader2
} from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  unit_price: number;
  price?: number;
  current_stock?: number;
  stock?: number;
  category?: string;
}

interface CartItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  document_number?: string;
  dni_ruc?: string;
}

interface Warehouse {
  id: number;
  name: string;
  code?: string;
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [docType, setDocType] = useState<'BOLETA' | 'FACTURA'>('BOLETA');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [cashReceived, setCashReceived] = useState<string>('');
  
  // Estado para almacenes/sedes
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1);

  // Estado para clientes
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: 'Cliente Varios (Público General)', document_number: '00000000' }
  ]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

 // 1. Cargar Almacenes
  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouses/');
      const list = Array.isArray(response.data) ? response.data : response.data.data;
      if (Array.isArray(list) && list.length > 0) {
        setWarehouses(list);
        // Solo asigna el primero si aún no hay ninguno seleccionado
        setSelectedWarehouseId((prev) => prev || list[0].id);
      }
    } catch (err) {
      console.error("Error al cargar almacenes:", err);
    }
  };

  // 2. Cargar Clientes
  const loadCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
        setSelectedCustomerId(data[0].id);
      }
    } catch (err) {
      console.error("Error al obtener lista de clientes:", err);
    }
  };

  // 3. Cargar Productos (Actualizado con warehouse_id)
  const loadProducts = async (warehouseId?: number) => {
    try {
      setFetchingProducts(true);
      // Usamos el warehouseId recibido o el selectedWarehouseId actual
      const targetWarehouseId = warehouseId ?? selectedWarehouseId;
      
      // Pasamos el ID del almacén al servicio
      const data = await saleService.getProducts(targetWarehouseId);
      
      const formatted = data.map((p: any) => ({
        id: p.id,
        sku: p.sku || `PROD-${p.id}`,
        name: p.name,
        price: parseFloat(p.unit_price || p.price || 0),
        unit_price: parseFloat(p.unit_price || p.price || 0),
        stock: p.current_stock ?? p.stock ?? 0,
        current_stock: p.current_stock ?? p.stock ?? 0,
        category: p.category || 'General'
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("Error al cargar productos del backend:", err);
      setFeedback({ type: 'error', message: 'No se pudo conectar con el servidor para cargar los productos.' });
    } finally {
      setFetchingProducts(false);
    }
  };

  // Cargar clientes y almacenes UNA sola vez al montar el componente
  useEffect(() => {
    loadCustomers();
    loadWarehouses();
  }, []);

  // Re-consultar los productos CADA VEZ que selectedWarehouseId cambie
  useEffect(() => {
    if (selectedWarehouseId) {
      loadProducts(selectedWarehouseId);
    }
  }, [selectedWarehouseId]);

  // Agregar al carrito
  const addToCart = (product: Product) => {
    const prodPrice = product.price || product.unit_price || 0;
    const prodStock = product.stock ?? product.current_stock ?? 0;

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= prodStock) return;
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: prodPrice,
        stock: prodStock,
        category: product.category || 'General',
        quantity: 1 
      }]);
    }
  };

  // Cambiar cantidad
  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Remover del carrito
  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // 4. Procesar Venta con warehouse_id
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);
      setFeedback(null);

      const payload = {
        company_id: 1,
        warehouse_id: Number(selectedWarehouseId),
        customer_id: Number(selectedCustomerId) || 1,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: Number(item.id),
          quantity: Number(item.quantity)
        }))
      };

      const response = await saleService.createSale(payload);

      setFeedback({ 
        type: 'success', 
        message: `¡Venta ${response.sale_code || ''} registrada con éxito!` 
      });

      setCart([]);
      setCashReceived('');
      await loadProducts(); // Recargar productos para reflejar el nuevo stock

    } catch (err: any) {
      console.error("Error al emitir venta:", err);

      let errorMessage = "Error al conectar con la API de ventas.";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => `${e.loc?.join(' -> ')}: ${e.msg}`).join(' | ');
        }
      }

      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Cálculos desglosados
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const subtotal = total / 1.18;
  const igv = total - subtotal;
  const change = Math.max(0, (parseFloat(cashReceived) || 0) - total);

  // Filtros
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category || 'General')))];
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0e131f] text-slate-200 flex flex-col font-sans text-xs">
      <Header />

      <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* COLUMNA IZQUIERDA: CATÁLOGO Y BÚSQUEDA */}
        <div className="lg:col-span-8 bg-[#151c2e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                Ventas y Pedidos (Punto de Venta)
              </h2>
              
              {/* SELECTOR DINÁMICO DE SEDES/ALMACENES */}
              <div className="flex items-center gap-2 bg-[#1e293b]/60 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-400">Sede:</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs pr-1"
                >
                  {warehouses.length > 0 ? (
                    warehouses.map((w) => (
                      <option key={w.id} value={w.id} className="bg-[#151c2e] text-white">
                        {w.name}
                      </option>
                    ))
                  ) : (
                    <option value={1} className="bg-[#151c2e] text-white">
                      Almacén Principal - Lima
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Buscador + Filtros por Categoría */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por Nombre, Código de Barras o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1e293b]/60 border border-slate-700/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-[#1e293b]/60 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estado de carga de productos */}
          {fetchingProducts ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Cargando productos desde la base de datos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {filteredProducts.map(product => {
                const pPrice = product.price || product.unit_price || 0;
                const pStock = product.stock ?? product.current_stock ?? 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-[#1b2338] hover:bg-[#212c47] border border-slate-800 hover:border-blue-500/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all group shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-[9px] text-blue-400 font-semibold">{product.sku}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${pStock < 5 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
                          Stock: {pStock}
                        </span>
                      </div>
                      <h4 className="font-medium text-white text-xs line-clamp-2 mb-2 group-hover:text-blue-300">
                        {product.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="font-bold text-sm text-cyan-400 font-mono">
                        S/ {pPrice.toFixed(2)}
                      </span>
                      <button className="p-1.5 bg-blue-600/20 group-hover:bg-blue-600 text-blue-400 group-hover:text-white rounded-lg transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: TICKET Y PAGOS */}
        <div className="lg:col-span-4 bg-[#151c2e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            
            {/* Cabecera del Ticket */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Comprobante de Venta
              </h3>

              <div className="flex bg-[#1e293b]/60 p-0.5 rounded-lg border border-slate-700/60">
                <button
                  onClick={() => setDocType('BOLETA')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${docType === 'BOLETA' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Boleta
                </button>
                <button
                  onClick={() => setDocType('FACTURA')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${docType === 'FACTURA' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Factura
                </button>
              </div>
            </div>

            {/* Asignación de Cliente */}
            <div className="flex items-center gap-2 bg-[#1b2338] p-2 rounded-lg border border-slate-800">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              >
                {customers.map(c => {
                  const docNum = c.document_number || c.dni_ruc || '';
                  return (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} {docNum ? `(${docNum})` : ''}
                    </option>
                  );
                })}
              </select>
              <button className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0" title="Agregar Nuevo Cliente">
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mensaje de Alerta / Notificación */}
            {feedback && (
              <div className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                <span>{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="font-bold ml-2">×</button>
              </div>
            )}

            {/* Lista de Items en el Carrito */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-[#1b2338] p-2 rounded-lg border border-slate-800">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-medium text-white truncate text-xs">{item.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      S/ {item.price.toFixed(2)} x {item.quantity} = <strong className="text-cyan-400">S/ {(item.price * item.quantity).toFixed(2)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-white font-mono text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-1">
                  <Package className="w-6 h-6 stroke-1 text-slate-600 mb-1" />
                  <span>No hay productos seleccionados</span>
                </div>
              )}
            </div>
          </div>

          {/* Bloque de Totales y Método de Pago */}
          <div className="space-y-3 border-t border-slate-800 pt-3">
            
            {/* Opciones de Método de Pago */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Método de Pago:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'EFECTIVO', name: 'Efectivo', icon: DollarSign },
                  { id: 'TARJETA', name: 'Tarjeta', icon: CreditCard },
                  { id: 'YAPE_PLIN', name: 'Yape / Plin', icon: QrCode },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium border text-[11px] transition-colors ${
                        paymentMethod === m.id
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 font-semibold'
                          : 'bg-[#1b2338] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo Monto Recibido si es Efectivo */}
            {paymentMethod === 'EFECTIVO' && (
              <div className="flex items-center justify-between bg-[#1b2338] p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Efectivo Recibido:</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-700/60 rounded px-2 py-1 text-right text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Resumen de Importes */}
            <div className="space-y-1 text-slate-400 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGV (18%):</span>
                <span className="font-mono text-slate-200">S/ {igv.toFixed(2)}</span>
              </div>
              {paymentMethod === 'EFECTIVO' && parseFloat(cashReceived) > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-800/60">
                  <span>Vuelto:</span>
                  <span className="font-mono">S/ {change.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total a Pagar:</span>
                <span className="font-mono text-cyan-400">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botón Completar Venta */}
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando Venta...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Completar y Emitir Venta
                </>
              )}
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}