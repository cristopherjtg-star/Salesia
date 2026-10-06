import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, BarChart3, PackageCheck, BrainCircuit, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [dni, setDni] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(dni, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Error de autenticación');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-salesia-dark flex flex-col lg:flex-row text-slate-100 font-sans">
      
      {/* SECCIÓN IZQUIERDA: Presentación e Información Corporativa */}
      <div className="lg:w-7/12 bg-slate-900/60 border-r border-slate-800/80 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Adorno de fondo con gradiente sutil */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-salesia-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-salesia-cyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Superior */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-gradient-to-tr from-salesia-primary to-salesia-cyan rounded-xl shadow-lg shadow-salesia-primary/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-salesia-primary to-salesia-cyan bg-clip-text text-transparent">
            SalesIA Enterprise
          </span>
        </div>

        {/* Mensaje Principal y Propuesta de Valor */}
        <div className="my-12 relative z-10 max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Gestión Comercial e Inteligencia de Negocios <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-salesia-primary via-salesia-cyan to-emerald-400 bg-clip-text text-transparent">
              Impulsada por Analítica Estadística
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Plataforma integral para la toma de decisiones empresariales mediante modelos Bayesianos, 
            control de inventario Kardex y métricas cuantitativas en tiempo real.
          </p>

          {/* Tarjetas de Módulos Destacados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 backdrop-blur-sm">
              <div className="p-2 bg-salesia-primary/10 text-salesia-primary rounded-lg mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Motor Estadístico</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cálculo de media, mediana e inferencias cuantitativas automáticas.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 backdrop-blur-sm">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Inventario & Kardex</h4>
                <p className="text-xs text-slate-400 mt-0.5">Trazabilidad completa de entradas, salidas y alertas de stock bajo.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 backdrop-blur-sm">
              <div className="p-2 bg-salesia-cyan/10 text-salesia-cyan rounded-lg mt-0.5">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Teorema de Bayes</h4>
                <p className="text-xs text-slate-400 mt-0.5">Diagnósticos predictivos e insights basados en probabilidades.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 backdrop-blur-sm">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Seguridad & RBAC</h4>
                <p className="text-xs text-slate-400 mt-0.5">Control de acceso por roles y registro de auditoría de acciones.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del lado izquierdo */}
        <div className="text-xs text-slate-500 border-t border-slate-800/60 pt-4 relative z-10">
          © {new Date().getFullYear()} SalesIA Enterprise. Todos los derechos reservados.
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Login */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 lg:p-12 bg-salesia-dark">
        <div className="max-w-md w-full bg-salesia-card border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-salesia-primary to-salesia-cyan bg-clip-text text-transparent">
              SalesIA Enterprise
            </h1>
            <p className="text-sm text-slate-400 mt-2">Ingrese su DNI corporativo para acceder</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">DNI</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="12345678"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-salesia-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-salesia-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-salesia-primary/20 disabled:opacity-50 active:scale-[0.99] transform"
            >
              {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}