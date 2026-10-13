import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Moon, Sun, Bell } from 'lucide-react';

interface HeaderProps {
  onSync?: () => void;
  onGenerateReport?: () => void;
}

export default function Header({ onSync, onGenerateReport }: HeaderProps) {
  // Inicializa leyendo la preferencia guardada o la clase existente
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d131f] text-slate-800 dark:text-white transition-colors duration-200 px-6 flex items-center justify-between shadow-sm">
      {/* Migas de pan */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        <span>1. EJECUTIVO</span> / <span className="font-semibold text-slate-900 dark:text-white">DASHBOARD</span>
      </div>

      {/* Acciones principales */}
      <div className="flex items-center gap-3">
        {/* Sincronizar */}
        <button
          onClick={onSync}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sincronizar
        </button>

        {/* Generar Reporte */}
        <button
          onClick={onGenerateReport}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Generar Reporte
        </button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 mx-1" />

        {/* Botón Cambio de Tema */}
        <button
          onClick={toggleTheme}
          type="button"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notificaciones */}
        <button 
          type="button"
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Perfil */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">
            MR
          </div>
        </div>
      </div>
    </header>
  );
}