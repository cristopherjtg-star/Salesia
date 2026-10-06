import { useState, useEffect } from 'react';
import { saleService } from '../../services/salesService';
import { ShoppingCart, Plus, Trash2, CheckCircle, CreditCard } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  unit_price: number;
  sku: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('EFECTIVO'); // Nuevo estado para el método de pago
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    saleService.getProducts()
      .then((data) => setProducts(data))
      .catch(() => setErrorMsg('Error al cargar el catálogo de productos.'));
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (cart.length === 0) {
      setErrorMsg('El carrito está vacío.');
      return;
    }

    try {
      const payload = {
        company_id: 1,
        customer_id: 1,
        sale_code: `POS-${Date.now()}`,
        items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        payment_method: paymentMethod // Envía el método seleccionado dinámicamente
      };

      await saleService.createSale(payload);
      setSuccessMsg('¡Venta procesada con éxito y pago registrado!');
      setCart([]);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al procesar la venta.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-4rem)]">
      {/* Catálogo de Productos */}
      <div className="lg:col-span-2 bg-salesia-card border border-slate-800 rounded-xl p-6 flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-salesia-primary" />
          Catálogo de Productos
        </h2>

        {errorMsg && <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">{errorMsg}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1 pr-2 content-start">
          {products.map((prod) => (
            <div 
              key={prod.id} 
              onClick={() => addToCart(prod)}
              className="bg-slate-900 border border-slate-700/60 rounded-xl p-4 cursor-pointer hover:border-salesia-primary transition-all flex flex-col justify-between h-36 shadow-md"
            >
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{prod.sku}</span>
                <h3 className="text-sm font-semibold text-slate-200 mt-1 line-clamp-2">{prod.name}</h3>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-salesia-cyan font-bold text-base">${Number(prod.unit_price).toFixed(2)}</span>
                <button className="p-2 bg-salesia-primary/20 text-salesia-primary rounded-lg hover:bg-salesia-primary hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrito / Facturación POS */}
      <div className="bg-salesia-card border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Ticket de Venta</h2>
          
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <div className="space-y-3 max-h-[34vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No hay productos seleccionados</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <h4 className="text-xs font-medium text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">{item.quantity} x ${Number(item.unit_price).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-2 mt-2">
          {/* Selector de Método de Pago */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-salesia-primary" /> Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 focus:outline-none focus:border-salesia-primary"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
            </select>
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>IGV (18%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800/60">
            <span>Total a Pagar</span>
            <span className="text-salesia-cyan">${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full mt-2 bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-salesia-primary/20 disabled:opacity-50 text-sm"
          >
            Completar Venta
          </button>
        </div>
      </div>
    </div>
  );
}