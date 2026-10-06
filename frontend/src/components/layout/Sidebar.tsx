import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Brain, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuGroups: MenuGroup[] = [
    {
      title: "MAIN",
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Punto de Venta (POS)', path: '/pos', icon: ShoppingCart },
      ]
    },
    {
      title: "GESTIÓN",
      items: [
        { name: 'Inventario & Kardex', path: '/inventory', icon: Package },
        { name: 'Clientes', path: '/customers', icon: Users },
      ]
    },
    {
      title: "INTELIGENCIA IA",
      items: [
        { name: 'Motor Estadístico', path: '/statistics', icon: BarChart3 },
        { name: 'Teorema de Bayes', path: '/bayes', icon: Brain },
        { name: 'Insights Automáticos', path: '/insights', icon: FileText },
      ]
    },
    {
      title: "SISTEMA",
      items: [
        { name: 'Usuarios & RBAC', path: '/users', icon: Settings },
        { name: 'Auditoría', path: '/audit', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-salesia-dark border-r border-slate-800 flex flex-col h-screen">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-salesia-primary to-salesia-cyan bg-clip-text text-transparent">
          SalesIA Enterprise
        </h1>
        <p className="text-xs text-slate-400 mt-1">DNI: {user?.dni || 'N/A'}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <p className="text-[10px] font-semibold tracking-wider text-slate-500 mb-2 px-3">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-salesia-primary text-white shadow-lg shadow-salesia-primary/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}