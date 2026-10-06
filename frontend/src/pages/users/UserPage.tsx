import React, { useEffect, useState } from 'react';
import { userService, type User } from '../../services/userService';
import { ShieldCheck, UserPlus, Users, UserCheck, Mail, IdCard, Lock, ShieldAlert } from 'lucide-react';

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado para la pestaña activa ('register' | 'details')
  const [activeTab, setActiveTab] = useState<'register' | 'details'>('register');

  // Estado del usuario seleccionado para la pestaña de consulta
  const [selectedUserId, setSelectedUserId] = useState<string | number>('');

  // Estado del formulario de registro
  const [dni, setDni] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError('Error al cargar los usuarios del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (typeof (userService as any).createUser === 'function') {
        await (userService as any).createUser({
          dni,
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role_id: Number(roleId),
        });
      } else if (typeof (userService as any).registerUser === 'function') {
        await (userService as any).registerUser({
          dni,
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role_id: Number(roleId),
        });
      }

      setSuccessMsg('¡Usuario registrado con éxito!');
      setDni('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRoleId(1);
      fetchUsers();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(typeof detail === 'string' ? detail : 'Error al registrar el usuario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener el objeto del usuario actualmente seleccionado
  const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));

  // Manejar clic en una fila de la tabla para ver los detalles directamente
  const handleSelectUserFromTable = (user: User) => {
    setSelectedUserId(user.id);
    setActiveTab('details');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-salesia-cyan" />
          Gestión de Usuarios & RBAC
        </h1>
        <p className="text-sm text-slate-400">
          Administración de accesos, roles y permisos de los actores del sistema.
        </p>
      </div>

      {/* Mensajes de Alerta */}
      {error && <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm">{successMsg}</div>}

      {/* Grid Principal (12 columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA (4 columnas): Pestañas + Formulario / Consulta */}
        <div className="lg:col-span-4 bg-salesia-card border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          
          {/* Pestañas SUPERIORES (Tabs) */}
          <div className="flex border-b border-slate-800 bg-slate-900/60">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'register'
                  ? 'border-salesia-cyan text-salesia-cyan bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-salesia-cyan text-salesia-cyan bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Detalles Usuario
            </button>
          </div>

          <div className="p-5">
            {/* OPCIÓN 1: PESTAÑA REGISTRAR NUEVO USUARIO */}
            {activeTab === 'register' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">DNI / Documento</label>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                    placeholder="Ej. 12345678"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nombres</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                      placeholder="Ej. Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Apellidos</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                      placeholder="Ej. Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Rol de Acceso</label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                  >
                    <option value={1}>Rol 1 - Administrador</option>
                    <option value={2}>Rol 2 - Vendedor (POS)</option>
                    <option value={3}>Rol 3 - Almacén / Inventario</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Registrar Usuario'}
                </button>
              </form>
            )}

            {/* OPCIÓN 2: PESTAÑA SELECCIONAR / CONSULTAR USUARIO (BLOQUEADO) */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Desplegable para seleccionar usuario */}
                <div>
                  <label className="block text-xs font-semibold text-salesia-cyan mb-1.5 uppercase tracking-wider">
                    Seleccionar Usuario
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-cyan"
                  >
                    <option value="" disabled>-- Selecciona un usuario --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name} ({u.dni || u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUser ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">DNI / Documento</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={selectedUser.dni || '-'}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 cursor-not-allowed select-none opacity-80"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nombres y Apellidos</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={`${selectedUser.first_name} ${selectedUser.last_name}`}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 cursor-not-allowed select-none opacity-80"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={selectedUser.email}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 cursor-not-allowed select-none opacity-80"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Rol ID</label>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={`Rol ${selectedUser.role_id}`}
                          className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 cursor-not-allowed select-none opacity-80 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={selectedUser.is_active ? 'Activo' : 'Inactivo'}
                          className={`w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-sm font-medium cursor-not-allowed select-none opacity-80 ${
                            selectedUser.is_active ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 text-center mt-2">
                      🔒 Información en modo lectura (Solo consulta).
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No hay información disponible para mostrar.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA (8 columnas): Tabla de Usuarios */}
        <div className="lg:col-span-8 bg-salesia-card border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-salesia-primary" />
                Directorio de Usuarios
              </h3>
              <span className="text-xs text-slate-400">Total: {users.length}</span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">Cargando usuarios...</div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 sticky top-0 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold">DNI</th>
                      <th className="px-4 py-3 font-semibold">Nombres y Apellidos</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Rol ID</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No hay usuarios registrados en el sistema.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const isSelected = String(user.id) === String(selectedUserId);
                        return (
                          <tr
                            key={user.id}
                            onClick={() => handleSelectUserFromTable(user)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-salesia-cyan/10 border-l-4 border-l-salesia-cyan'
                                : 'hover:bg-slate-900/40'
                            }`}
                          >
                            <td className="px-4 py-3 font-mono text-xs">{user.dni || '-'}</td>
                            <td className="px-4 py-3 font-medium text-white">
                              {`${user.first_name} ${user.last_name}`}
                            </td>
                            <td className="px-4 py-3 text-slate-400">{user.email}</td>
                            <td className="px-4 py-3">
                              <span className="bg-blue-600/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                                Rol {user.role_id}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium">
                              <span className={user.is_active ? 'text-emerald-400' : 'text-rose-400'}>
                                {user.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-900/40 border-t border-slate-800 text-center text-xs text-slate-500">
            Haz clic en cualquier usuario de la tabla para ver sus detalles en el panel de la izquierda ➔
          </div>
        </div>

      </div>
    </div>
  );
}