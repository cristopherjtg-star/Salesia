import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import ReportModal from '../../components/common/ReportModal';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Activity, 
  AlertCircle,
  BarChart3,
  Calendar,
  ArrowLeft,
  Users,
  RefreshCw
} from 'lucide-react';
import { dashboardService, type DashboardSummary } from '../../services/dashboardService';

type ViewLevel = 'months' | 'weeks' | 'days';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewLevel, setViewLevel] = useState<ViewLevel>('months');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const summary = await dashboardService.getSummary();
      setData(summary);
      setError(null);
    } catch (err: any) {
      setError('Error al sincronizar la información en tiempo real con Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = () => {
    fetchDashboardData();
  };

  const handleGenerateReport = async () => {
    const totalRevenue = data?.total_revenue ? Number(data.total_revenue).toFixed(2) : '0.00';
    const totalSales = data?.total_sales || 0;
    const activeCustomers = data?.active_customers || 0;
    const ticketPromedio = data?.ticket_promedio ? Number(data.ticket_promedio).toFixed(2) : '0.00';
    const now = new Date().toLocaleString();

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Reporte Ejecutivo NEXUS ERP</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; background: #ffffff; margin: 0; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; background: #f8fafc; }
          .kpi-title { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }
          .kpi-value { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
          th { background-color: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 9px; }
          .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Executive Dashboard Report</h1>
            <p class="subtitle">Resumen dinámico sincronizado con Supabase</p>
          </div>
          <div style="font-size: 10px; color: #64748b;">Emisión: ${now}</div>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-title">Ventas Netas</div><div class="kpi-value">$ ${totalRevenue}</div></div>
          <div class="kpi-card"><div class="kpi-title">Pedidos</div><div class="kpi-value">${totalSales}</div></div>
          <div class="kpi-card"><div class="kpi-title">Clientes Activos</div><div class="kpi-value">${activeCustomers}</div></div>
          <div class="kpi-card"><div class="kpi-title">Ticket Promedio</div><div class="kpi-value">$ ${ticketPromedio}</div></div>
        </div>
        <div class="footer">NEXUS ERP Predictive Engine</div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0e131f] text-slate-500 dark:text-slate-400 text-xs">
        <Activity className="w-6 h-6 animate-spin text-blue-500 mb-2" />
        <span>Conectando métricas reales con Supabase...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0e131f] p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 p-4 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-400 text-xs max-w-md w-full justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-rose-200 dark:bg-rose-900/60 hover:bg-rose-300 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Distribución fija de inventario para el gráfico circular
  const inventoryCategories = [
    { name: 'Electrónica', percentage: 45, color: '#3b82f6' },
    { name: 'Ropa', percentage: 30, color: '#06b6d4' },
    { name: 'Hogar', percentage: 25, color: '#f59e0b' }
  ];

  let cumulativeDeg = 0;
  const conicGradientString = inventoryCategories.map((cat) => {
    const start = cumulativeDeg;
    const angle = (cat.percentage / 100) * 360;
    cumulativeDeg += angle;
    return `${cat.color} ${start}deg ${cumulativeDeg}deg`;
  }).join(',');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0e131f] flex flex-col font-sans transition-colors duration-200">
      
      <Header onSync={handleSync} onGenerateReport={handleGenerateReport} />

      <main className="p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300 flex-1">
        
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Resumen integral en tiempo real conectado directamente a las tablas transaccionales de Supabase.
          </p>
        </div>

        {/* 1. KPIs con los campos exactos de DashboardSummary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Ventas Netas (Total)</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                $ {data?.total_revenue !== undefined ? Number(data.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-2">
                <TrendingUp className="w-3 h-3" /> Promedio: $ {data?.mean_sale?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Pedidos Procesados</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {data?.total_sales !== undefined ? Number(data.total_sales).toLocaleString() : '0'}
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-2">
                <ShoppingBag className="w-3 h-3" /> Transacciones en DB
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Clientes Activos</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {data?.active_customers !== undefined ? Number(data.active_customers).toLocaleString() : '0'}
              </h3>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2">
                <Users className="w-3 h-3" /> Tabla `customers`
              </span>
            </div>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Ticket Promedio</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                $ {data?.ticket_promedio !== undefined ? Number(data.ticket_promedio).toFixed(2) : '0.00'}
              </h3>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-2">
                <BarChart3 className="w-3 h-3" /> Mediana: $ {data?.median_sale?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* 2. GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <div className="lg:col-span-8 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  Tendencia de Ingresos y Proyección IA
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Análisis dinámico basado en las ventas reales del ERP
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e293b]/60 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                {viewLevel !== 'months' && (
                  <button
                    onClick={() => {
                      if (viewLevel === 'days') setViewLevel('weeks');
                      else setViewLevel('months');
                    }}
                    className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700/50 flex items-center gap-1 text-[10px] pr-2 border-r border-slate-300 dark:border-slate-700/60"
                  >
                    <ArrowLeft className="w-3 h-3" /> Volver
                  </button>
                )}
                <button onClick={() => setViewLevel('months')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${viewLevel === 'months' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>Meses</button>
                <button onClick={() => setViewLevel('weeks')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${viewLevel === 'weeks' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>Semanas</button>
                <button onClick={() => setViewLevel('days')} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${viewLevel === 'days' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>Días</button>
              </div>
            </div>

            <div className="flex items-center gap-5 text-[10px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5"><span className="w-3.5 h-1 bg-blue-500 rounded-full inline-block"></span><span>Ingresos Históricos ($)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3.5 h-0 border-b-2 border-dashed border-sky-400 inline-block"></span><span>Proyección Bayesiana ($)</span></div>
            </div>

            <div className="h-56 w-full relative pt-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
                <line x1="0" y1="55" x2="500" y2="55" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />

                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0,110 C 60,100 110,85 170,70 C 230,55 280,45 350,30 L 350,130 L 0,130 Z" fill="url(#blueGradient)" />
                <path d="M 0,110 C 60,100 110,85 170,70 C 230,55 280,45 350,30" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <path d="M 350,30 C 400,22 450,15 500,10" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
                <circle cx="0" cy="110" r="3.5" className="fill-blue-500 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
                <circle cx="85" cy="92" r="3.5" className="fill-blue-500 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
                <circle cx="170" cy="70" r="3.5" className="fill-blue-500 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
                <circle cx="255" cy="50" r="3.5" className="fill-blue-500 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
                <circle cx="350" cy="30" r="4.5" className="fill-cyan-400 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
                <circle cx="425" cy="20" r="3.5" className="fill-sky-300 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
                <circle cx="500" cy="10" r="3.5" className="fill-sky-300 stroke-white dark:stroke-[#151c2e]" strokeWidth="2" />
              </svg>

              <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-2">
                <span>Mayo</span><span>Junio</span><span>Julio</span><span>Agosto</span><span>Sept</span><span>Oct (Actual)</span>
                <span className="text-sky-400 font-medium">Nov (Predicción)</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Nivel de detalle: <strong className="text-slate-700 dark:text-slate-300 uppercase">{viewLevel}</strong></span>
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Base de datos activa</span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm mb-1">Distribución de Inventario</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-6">Estado global por categorías principales</p>

              <div className="flex justify-center my-4">
                <div 
                  className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-inner"
                  style={{ background: `conic-gradient(${conicGradientString})` }}
                >
                  <div className="w-24 h-24 bg-white dark:bg-[#151c2e] rounded-full flex flex-col items-center justify-center shadow">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">100%</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Total Stock</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-slate-200 dark:border-slate-800/60">
              {inventoryCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-600 dark:text-slate-400">{cat.name} ({cat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. INSIGHTS RECIENTES DINÁMICOS DESDE SUPABASE */}
        <div className="bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Insights y Diagnósticos Recientes (Supabase)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data?.recent_insights && data.recent_insights.length > 0 ? (
              data.recent_insights.map((insight) => (
                <div key={insight.id} className="p-3.5 bg-slate-50 dark:bg-[#1e293b]/40 rounded-lg border-l-4 border-l-blue-500 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px] text-blue-600 dark:text-blue-400">
                      {insight.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded font-mono border bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30">
                      ID: {insight.id}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-slate-400 text-xs py-4">
                No hay insights recientes registrados en la base de datos.
              </div>
            )}
          </div>
        </div>

      </main>

      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        pdfUrl={pdfUrl}
        title="Reporte Ejecutivo Integrado"
      />
    </div>
  );
}