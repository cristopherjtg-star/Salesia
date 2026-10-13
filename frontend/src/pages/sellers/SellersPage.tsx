import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  CheckCircle,
  X,
  Edit3,
  Power
} from 'lucide-react';
import { sellersService } from '../../services/sellersService';
import api from '../../services/api'; // Para cargar los usuarios disponibles

export const SellersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [editingSeller, setEditingSeller] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    user_id: '',
    position: 'Administrador',
    hire_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadEmployees();
    loadUsers();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await sellersService.getAll();
      if (response && response.data) {
        setSellers(response.data);
      }
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response && response.data) {
        setUsersList(response.data);
      }
    } catch (error) {
      console.error("Error al cargar lista de usuarios:", error);
    }
  };

  const handleOpenCreate = () => {
    setEditingSeller(null);
    setFormData({
      user_id: usersList[0]?.id ? String(usersList[0].id) : '',
      position: 'Administrador',
      hire_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (seller: any) => {
    setEditingSeller(seller);
    setFormData({
      user_id: String(seller.user_id),
      position: seller.position,
      hire_date: seller.hire_date || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        company_id: 1,
        user_id: Number(formData.user_id),
        position: formData.position,
        hire_date: formData.hire_date,
        is_active: true
      };

      if (editingSeller && editingSeller.id) {
        await sellersService.update(editingSeller.id, payload);
        setSuccessMessage('¡Personal actualizado exitosamente!');
      } else {
        await sellersService.create(payload);
        setSuccessMessage('¡Personal registrado exitosamente!');
      }

      await loadEmployees();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar empleado:", error);
    }
  };

  const handleToggleStatus = async (seller: any) => {
    if (!seller.id) return;
    const actionText = seller.is_active ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${actionText} a este empleado?`)) {
      try {
        if (seller.is_active) {
          await sellersService.deactivate(seller.id);
        } else {
          await sellersService.update(seller.id, { is_active: true });
        }
        await loadEmployees();
        setSuccessMessage(`Empleado ${seller.is_active ? 'desactivado' : 'activado'} correctamente.`);
      } catch (error) {
        console.error("Error al cambiar estado:", error);
      }
    }
  };

  return (
    <div className="p-6 bg-[#0B0F17] min-h-screen text-slate-100 space-y-6 relative">
      
      {/* Notificación Flotante de Éxito */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#131B2A] border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">¡Aviso!</h3>
              <p className="text-sm text-slate-300">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-900/30"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold">Módulo de Vendedores / Personal</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión del personal y asignación de cargos operativos.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Empleado
        </button>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-[#131B2A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0B0F17] text-xs text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Colaborador / Usuario</th>
              <th className="px-6 py-3.5">Cargo</th>
              <th className="px-6 py-3.5">Fecha Contratación</th>
              <th className="px-6 py-3.5">Estado</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sellers.map((seller, idx) => (
              <tr key={seller.id || idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white">
                    {seller.users ? `${seller.users.first_name} ${seller.users.last_name}` : `Usuario ID: ${seller.user_id}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    {seller.users ? seller.users.email : 'Sin correo asociado'}
                  </div>
                </td>
                <td className="px-6 py-4 text-cyan-400 font-medium">
                  {seller.position || 'Sin cargo asignado'}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {seller.hire_date || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    seller.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {seller.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(seller)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Editar Empleado"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(seller)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      seller.is_active ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30'
                    }`}
                    title={seller.is_active ? 'Desactivar' : 'Activar'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No hay personal registrado en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Registro / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131B2A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingSeller ? 'Editar Ficha de Personal' : 'Registrar Nuevo Personal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Seleccionar Usuario del Sistema</label>
                <select 
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  required
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="" disabled>Seleccione un usuario...</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Cargo / Posición</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Administrador, Almacén, Vendedor"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Fecha de Contratación</label>
                <input 
                  type="date" 
                  required
                  value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
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
                  {editingSeller ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};