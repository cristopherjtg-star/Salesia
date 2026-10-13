import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Percent, 
  Zap, 
  FileSpreadsheet, 
  Users, 
  Boxes, 
  UserCheck, 
  Warehouse, 
  UserCog, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
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
      title: "1. EJECUTIVO",
      items: [
        { name: 'Dashboard Executive', path: '/', icon: LayoutDashboard, badge: 'Live', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      ]
    },
    {
      title: "2. OPERACIONES",
      items: [
        { name: 'Ventas y Pedidos', path: '/sales', icon: ShoppingCart, badge: '3', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        { name: 'Inventario y Stock', path: '/inventory', icon: Package },
      ]
    },
    {
      title: "3. ANALÍTICA E IA",
      items: [
        { name: 'Analytics Comercial', path: '/statistics', icon: TrendingUp },
        { name: 'Probabilidades & Bayes', path: '/bayes', icon: Percent, badge: 'ƒ', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        { name: 'Motor de Insights', path: '/insights', icon: Zap, badge: '•', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
        { name: 'Reportes', path: '/reports', icon: FileSpreadsheet },
      ]
    },
    {
      title: "4. MANTENIMIENTO",
      items: [
        { name: 'Clientes', path: '/customers', icon: Users },
        { name: 'Catálogo Productos', path: '/maintenance/products', icon: Boxes },
        { name: 'Vendedores / Personal', path: '/sellers', icon: UserCheck },
        { name: 'Almacenes y Sedes', path: '/branches', icon: Warehouse },
      ]
    },
    {
      title: "5. ADMINISTRACIÓN",
      items: [
        { name: 'Usuarios y Roles', path: '/users', icon: UserCog },
        { name: 'Auditoría & Logs', path: '/audit', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col h-screen font-sans text-xs shrink-0 select-none">
      
      {/* Header con Branding NEXUS ERP */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
          N
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
            NEXUS ERP
          </h1>
          <p className="text-[9px] font-semibold text-slate-400 tracking-tight uppercase">
            PREDICTIVE ENGINE V1.2
          </p>
        </div>
      </div>

      {/* Menú de Navegación por Secciones */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 px-2 py-1 uppercase">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer con usuario logueado */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080b12] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
            EA
          </div>
          <div className="min-w-0">
           <p className="text-[11px] font-semibold text-slate-200 truncate">
  {(user as any)?.first_name ? `${(user as any).first_name} ${(user as any).last_name || ''}` : 'Eduardo Altamirano'}
</p>
            <p className="text-[9px] text-slate-500 truncate">
              Chief Operations Admin
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}