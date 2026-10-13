import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  // Estructura de menú categorizada y numerada estilo Nexus ERP
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
    <aside className="w-64 bg-[#0d131f] border-r border-slate-800 flex flex-col justify-between h-screen select-none font-sans">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-600/30">
            N
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide leading-tight">NEXUS ERP</h1>
            <span className="text-[10px] text-blue-400 font-medium">PREDICTIVE ENGINE v1.2</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Título de la Sección Numerada */}
            <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </h2>

            {/* Submenú items */}
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

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090d16]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs">
              EA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Eduardo Altamirano</p>
              <p className="text-[9px] text-slate-400 truncate">Chief Operations Admin</p>
            </div>
          </div>
          <button 
            title="Cerrar Sesión" 
            className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};