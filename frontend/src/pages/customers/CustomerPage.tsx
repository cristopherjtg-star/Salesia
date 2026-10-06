import { useState, useEffect } from 'react';
import { customerService, type Customer } from '../../services/customerService';
import { PeruMap } from '../../components/PeruMap';
import { Users, UserPlus, Mail, Phone, CreditCard, MapPin } from 'lucide-react';

const PERU_DEPARTMENTS = [
  'Amazonas', 'Ancash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Cliente seleccionado en la tabla para reflejarlo en el mapa
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Estado para el formulario de nuevo cliente
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Lima'); // El departamento se guarda en address
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCustomers = () => {
    customerService.getCustomers()
      .then((data) => {
        setCustomers(data);
        if (data.length > 0 && !selectedCustomer) {
          setSelectedCustomer(data[0]); // Seleccionar el primero por defecto
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar la cartera de clientes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      await customerService.createCustomer({
        name,
        document_type: documentType,
        document_number: documentNumber,
        email,
        phone,
        address // Se envía el departamento dentro del campo address
      });
      setSuccessMsg('¡Cliente registrado con éxito!');
      setName('');
      setDocumentType('DNI');
      setDocumentNumber('');
      setEmail('');
      setPhone('');
      setAddress('Lima');
      fetchCustomers();
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map((e: any) => e.msg).join(', '));
      } else if (typeof errorDetail === 'object' && errorDetail !== null) {
        setError(JSON.stringify(errorDetail));
      } else {
        setError(errorDetail || 'Error al registrar el cliente.');
      }
    }
  };

  if (loading) return <div className="text-slate-400 p-6">Cargando clientes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-salesia-cyan" />
            Gestión de Clientes
          </h1>
          <p className="text-sm text-slate-400">Directorio, control de cartera y ubicación geográfica</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm">{successMsg}</div>}

      {/* Grid principal en 12 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMNA IZQUIERDA (5 columnas de ancho): Agrupa Formulario + Directorio */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 1. Formulario de Registro */}
          <div className="bg-salesia-card border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-salesia-primary" />
              Nuevo Cliente
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo / Razón Social</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              
              {/* Selector de Tipo y Número de Documento */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nº de Documento</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                    placeholder="Número de documento"
                  />
                </div>
              </div>

              {/* Selector de Departamento (Guardado en address) */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Departamento (Ubicación)</label>
                <select
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                >
                  {PERU_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary"
                  placeholder="Número telefónico"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md"
              >
                Registrar Cliente
              </button>
            </form>
          </div>

          {/* 2. Listado de Clientes */}
          <div className="bg-salesia-card border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between flex-1">
            <div>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-salesia-primary" />
                  Directorio de Clientes
                </h3>
                <span className="text-xs text-slate-400">Total: {customers.length}</span>
              </div>

              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 sticky top-0 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Cliente</th>
                      <th className="px-4 py-3 font-semibold">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No hay clientes registrados en el sistema.
                        </td>
                      </tr>
                    ) : (
                      customers.map((cust) => {
                        const isSelected = selectedCustomer?.id === cust.id;
                        return (
                          <tr
                            key={cust.id}
                            onClick={() => setSelectedCustomer(cust)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-salesia-cyan/10 border-l-4 border-l-salesia-cyan' : 'hover:bg-slate-900/40'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-white">{cust.name}</div>
                              <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <CreditCard className="w-3 h-3 text-salesia-primary" />
                                <span className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded text-[9px]">
                                  {cust.document_type || 'DNI'}
                                </span>
                                {cust.document_number}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-slate-900 border border-slate-800 text-salesia-cyan px-2 py-1 rounded-md flex items-center w-fit gap-1">
                                <MapPin className="w-3 h-3 text-salesia-cyan" />
                                {cust.address || 'Lima'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-3 bg-slate-900/40 border-t border-slate-800 text-center text-xs text-slate-500">
              Haz clic en cualquier cliente para ver su departamento en el mapa ➔
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA (7 columnas de ancho): Mapa Interactivo a alto completo */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <PeruMap selectedDepartment={selectedCustomer?.address || 'Lima'} />
        </div>

      </div>
    </div>
  );
}