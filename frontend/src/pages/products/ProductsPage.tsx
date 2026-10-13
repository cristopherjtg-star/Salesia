import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { productsService } from '../../services/productService';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  company_id: number;
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  category: string;
  unit_price: number;
  cost_price: number;
  margin?: number;
  current_stock?: number;
  is_active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    company_id: 1,
    sku: '',
    name: '',
    description: '',
    category_id: '1',
    unit_price: '',
    cost_price: '',
    is_active: true,
  });

  useEffect(() => {
    fetchProductsData();
  }, []);

  const fetchProductsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición real al backend de FastAPI (que lee de Supabase)
      const data = await productsService.getAll(1);
      setProducts(data);

      // Categorías de ejemplo base (puedes crear un categoriesService si lo deseas)
      setCategories([
        { id: 1, name: 'Bebidas' },
        { id: 2, name: 'Abarrotes' },
        { id: 3, name: 'Limpieza' },
        { id: 4, name: 'Electrónica' },
      ]);
    } catch (err: any) {
      setError('Error al conectar con el servidor para cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        company_id: product.company_id || 1,
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category_id: product.category_id.toString(),
        unit_price: product.unit_price.toString(),
        cost_price: product.cost_price.toString(),
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        company_id: 1,
        sku: '',
        name: '',
        description: '',
        category_id: categories[0]?.id.toString() || '1',
        unit_price: '',
        cost_price: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        company_id: Number(formData.company_id),
        category_id: Number(formData.category_id),
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unit_price: parseFloat(formData.unit_price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, payload);
      } else {
        await productsService.create(payload);
      }

      await fetchProductsData();
      handleCloseModal();
    } catch (err) {
      alert("Error al guardar el producto en la base de datos.");
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      await productsService.update(product.id, { is_active: !product.is_active });
      setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    } catch (err) {
      alert("No se pudo actualizar el estado del producto.");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || product.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0e131f] flex flex-col font-sans text-xs text-slate-600 dark:text-slate-300 transition-colors duration-200">
      <Header onSync={fetchProductsData} />

      <main className="p-6 space-y-5 flex-1">
        
        {/* Encabezado del Módulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Catálogo de Productos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Gestión e inventario maestro de SKUs, precios y márgenes comerciales (Datos reales de Supabase).
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por SKU o Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla Principal */}
        <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span>Sincronizando con Supabase...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#1b2338] border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-right">Precio Costo</th>
                    <th className="py-3 px-4 text-right">Precio Venta</th>
                    <th className="py-3 px-4 text-center">Margen</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredProducts.map((product) => {
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1e293b]/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                          {product.sku}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {product.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 text-[10px]">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          S/ {product.cost_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          S/ {product.unit_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <TrendingUp className="w-3 h-3" /> {product.margin ?? 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleStatus(product)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                              product.is_active
                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {product.is_active ? (
                              <><CheckCircle2 className="w-3 h-3" /> Activo</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> Inactivo</>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                            title="Editar Producto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron productos registrados en la base de datos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal para Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">SKU / Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="EJ: ELE-001"
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Categoría ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Coca Cola 1.5L"
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Precio Costo (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Precio Venta (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-slate-300 text-[11px] select-none">
                  Producto activo para la venta
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}