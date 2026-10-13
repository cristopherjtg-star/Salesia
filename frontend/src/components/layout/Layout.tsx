import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart2, 
  Brain, 
  Lightbulb, 
  FileText, 
  ShieldCheck, 
  LogOut,
  UserCheck,
  Search, 
  Bell, 
  ChevronDown 
} from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  // Secciones del menú organizadas por categorías numeradas estilo Nexus ERP
  const menuSections = [
    {
      title: '1. EJECUTIVO',
      items: [
        { path: '/', label: 'Dashboard Executive', icon: LayoutDashboard },
      ]
    },
    {
      title: '2. OPERACIONES',
      items: [
        { path: '/ventas', label: 'Ventas y Pedidos', icon: ShoppingCart },
        { path: '/inventario', label: 'Inventario y Stock', icon: Package },
      ]
    },
    {
      title: '3. ANALÍTICA E IA',
      items: [
        { path: '/analisis-comercial', label: 'Analytics Comercial', icon: BarChart2 },
        { path: '/bayes', label: 'Probabilidades & Bayes', icon: Brain },
        { path: '/insights', label: 'Motor de Insights', icon: Lightbulb },
        { path: '/reportes', label: 'Reportes', icon: FileText },
      ]
    },
    {
      title: '4. MANTENIMIENTO Y SISTEMA',
      items: [
        { path: '/clientes', label: 'Clientes', icon: Users },
        { path: '/usuarios', label: 'Usuarios y Roles', icon: UserCheck },
        { path: '/auditoria', label: 'Auditoría & Logs', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0b0f17] text-slate-200 font-sans overflow-hidden">
      
      {/* Top Header */}
      <header className="h-14 bg-[#111827] border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-600/30">
              N
            </div>
            <span className="font-semibold text-white text-sm tracking-wide">NEXUS ERP</span>
          </div>
          
          <div className="h-4 w-[1px] bg-slate-700" />
          
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white font-medium">Predictive Engine v1.2</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>

        {/* Acciones de la derecha en el Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar en el sistema..." 
              className="bg-[#1e293b] text-slate-200 text-xs rounded-lg pl-9 pr-4 py-1.5 border border-slate-700/60 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          <button className="text-slate-400 hover:text-white p-1 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs">
              EA
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-200 font-medium leading-none">Eduardo Altamirano</p>
              <p className="text-[9px] text-slate-400 leading-none mt-0.5">Chief Operations Admin</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
          </div>
        </div>
      </header>

      {/* Main Content Area con Sidebar Lateral */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Categorizado */}
        <aside className="w-64 bg-[#0d131f] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
          <nav className="p-3 space-y-4 overflow-y-auto">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h2>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-3 border-t border-slate-800/80 bg-[#090d16]">
            <button 
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#111827] border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors text-xs font-medium"
            >
              <span>Cerrar Sesión</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#0b0f17] p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};