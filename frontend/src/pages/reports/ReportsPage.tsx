import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, FileText, Calendar, Filter } from 'lucide-react';
import { reportsService } from '../../services/reportsService';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState('SALES');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportsService.getAll();
      if (response && response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const titlesMap: Record<string, string> = {
        SALES: "Reporte General de Ventas",
        INVENTORY: "Reporte de Inventario y Stock",
        PERSONAL: "Reporte de Personal y Colaboradores"
      };

      const response = await reportsService.create({
        company_id: 1,
        user_id: 1,
        title: titlesMap[reportType] || `Reporte ${reportType}`,
        report_type: reportType,
        parameters: { 
          start_date: startDate,
          end_date: endDate
        }
      });
      
      await loadReports();
      setSuccessMessage(response.message || '¡Reporte generado y guardado en la base de datos!');
    } catch (error) {
      console.error("Error al generar reporte:", error);
    }
  };

  // Función optimizada para exportar los datos reales a CSV
  const handleDownloadCSV = (report: any) => {
    const previewData = report.parameters?.data_preview || [];
    if (previewData.length === 0) {
      alert("Este reporte no contiene datos almacenados para exportar.");
      return;
    }

    // Aplanar los objetos anidados (como 'users' en personal o 'products' en inventario) para que el CSV salga limpio
    const flattenedData = previewData.map((item: any) => {
      const flat: Record<string, any> = {};
      
      // Recorremos las propiedades del objeto principal
      for (const key in item) {
        if (typeof item[key] === 'object' && item[key] !== null) {
          // Si es un objeto relacionado (ej: users, products, warehouses), extraemos sus campos clave
          for (const subKey in item[key]) {
            flat[`${key}_${subKey}`] = item[key][subKey];
          }
        } else {
          flat[key] = item[key];
        }
      }
      return flat;
    });

    const headers = Object.keys(flattenedData[0]);
    const rows = flattenedData.map((row: any) => 
      headers.map(header => {
        const val = row[header];
        return `"${val !== undefined && val !== null ? String(val).replace(/"/g, '""') : ''}"`;
      }).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}_${report.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-[#0B0F17] min-h-screen text-slate-100 space-y-6 relative">
      
      {successMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#131B2A] border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">¡Éxito!</h3>
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

      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold">Módulo de Reportes & Analítica</h1>
        <p className="text-xs text-slate-400 mt-1">Generación y exportación de reportes ejecutivos consolidados.</p>
      </div>

      <div className="bg-[#131B2A] border border-slate-800 rounded-xl p-6">
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Tipo de Reporte
            </label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="SALES">Ventas y Facturación</option>
              <option value="INVENTORY">Inventario y Stock</option>
              <option value="PERSONAL">Personal y RRHH</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Fecha Inicio
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Fecha Fin
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button 
            type="submit" 
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generar Reporte
          </button>
        </form>
      </div>

      <div className="bg-[#131B2A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0B0F17] text-xs text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Título del Reporte</th>
              <th className="px-6 py-3.5">Categoría</th>
              <th className="px-6 py-3.5">Registros Procesados</th>
              <th className="px-6 py-3.5">Ruta de Archivo</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No hay reportes generados en la base de datos.
                </td>
              </tr>
            ) : (
              reports.map((rep, idx) => (
                <tr key={rep.id || idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    {rep.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {rep.report_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {rep.parameters?.total_records !== undefined ? `${rep.parameters.total_records} filas` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {rep.file_url}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownloadCSV(rep)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                      title="Exportar a CSV/Excel"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};