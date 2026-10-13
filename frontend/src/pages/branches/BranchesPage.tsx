import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  X, 
  Edit3, 
  Power, 
  MapPin, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { warehousesService } from '../../services/branchesService'; // Ajusta la ruta a tu servicio

export interface Warehouse {
  id?: number;
  company_id: number;
  code: string;
  name: string;
  address?: string;
  is_active?: boolean;
}

export const BranchesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: ''
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const response = await warehousesService.getAll();
      if (response && response.data) {
        setWarehouses(response.data);
      }
    } catch (error) {
      console.error("Error al cargar almacenes:", error);
    }
  };

  // Abrir modal para Crear
  const handleOpenCreateModal = () => {
    setEditingWarehouse(null);
    const nextNum = warehouses.length + 1;
    const autoCode = `ALM-${nextNum < 10 ? '0' + nextNum : nextNum}`;
    
    setFormData({
      code: autoCode,
      name: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para Editar
  const handleOpenEditModal = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormData({
      code: wh.code,
      name: wh.name,
      address: wh.address || ''
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWarehouse && editingWarehouse.id) {
        // ACTUALIZAR (UPDATE)
        await warehousesService.update(editingWarehouse.id, {
          code: formData.code,
          name: formData.name,
          address: formData.address
        });
        showAlert('¡Almacén actualizado correctamente!');
      } else {
        // CREAR (CREATE)
        await warehousesService.create({
          company_id: 1,
          code: formData.code,
          name: formData.name,
          address: formData.address,
          is_active: true
        });
        showAlert('¡Almacén registrado con éxito!');
      }

      await loadWarehouses();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar almacén:", error);
    }
  };

  // Cambiar Estado: Activar / Desactivar (Baja Lógica)
  const handleToggleStatus = async (wh: Warehouse) => {
    if (!wh.id) return;
    const actionText = wh.is_active ? 'desactivar' : 'activar';
    
    if (window.confirm(`¿Estás seguro de ${actionText} la sede "${wh.name}"?`)) {
      try {
        if (wh.is_active) {
          // Desactivación lógica
          await warehousesService.deactivate(wh.id);
        } else {
          // Reactivación
          await warehousesService.update(wh.id, { is_active: true });
        }
        await loadWarehouses();
        showAlert(`Sede ${wh.is_active ? 'desactivada' : 'activada'} correctamente.`);
      } catch (error) {
        console.error(`Error al ${actionText} la sede:`, error);
      }
    }
  };

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  return (
    <div className="p-6 bg-[#0B0F17] min-h-screen text-slate-100 space-y-6 relative">
      
      {/* Alerta / Notificación Flotante */}
      {alertMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#131B2A] border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{alertMessage}</span>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-cyan-400" />
            Módulo de Almacenes y Sedes
          </h1>
          <p className="text-xs text-slate-400 mt-1">Administración de sucursales y puntos de almacenamiento logístico.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
        >
          <Plus className="w-4 h-4" />
          Registrar Almacén
        </button>
      </div>

      {/* Grid de Almacenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {warehouses.map((wh) => (
          <div 
            key={wh.id || wh.code} 
            className={`bg-[#131B2A] border rounded-xl p-5 space-y-3 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
              wh.is_active ? 'border-slate-800 hover:border-slate-700' : 'border-rose-950/40 opacity-60 bg-[#0E1420]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded">
                  {wh.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  wh.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {wh.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <h3 className="font-bold text-white text-lg leading-tight">{wh.name}</h3>

              <div className="flex items-start gap-2 text-xs text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{wh.address || 'Sin dirección especificada'}</span>
              </div>
            </div>

            {/* Acciones CRUD */}
            <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenEditModal(wh)}
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Editar Almacén"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleStatus(wh)}
                className={`p-1.5 rounded-lg transition-colors ${
                  wh.is_active 
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' 
                    : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30'
                }`}
                title={wh.is_active ? 'Desactivar Sede' : 'Reactivar Sede'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {warehouses.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-[#131B2A] border border-slate-800 rounded-xl">
            No se encontraron almacenes o sedes registradas.
          </div>
        )}
      </div>

      {/* Modal para Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131B2A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingWarehouse ? 'Editar Almacén' : 'Nuevo Almacén / Sede'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Código Identificador</label>
                <input 
                  type="text" 
                  required
                  placeholder="Código (ej. ALM-01)"
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Nombre de la Sede</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Sucursal Arequipa"
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Dirección Física</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Av. Ejercito 456"
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-cyan-900/30"
                >
                  {editingWarehouse ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};