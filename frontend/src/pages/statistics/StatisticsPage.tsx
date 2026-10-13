import { useState } from 'react';
import { statsService } from '../../services/statsService';
import { BarChart3, Calculator, Activity, ArrowRight, Upload, FileText, CheckCircle2, Database, Sparkles, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<'database' | 'manual' | 'csv'>('database');
  const [inputData, setInputData] = useState<string>('');
  const [dbSource, setDbSource] = useState<'sales' | 'inventory'>('sales');
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedDatasetInfo, setUploadedDatasetInfo] = useState<{ id?: number; name?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Por favor selecciona un archivo con formato .CSV');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Por favor selecciona un archivo con formato .CSV');
      }
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (activeTab === 'manual') {
        const parsedData = inputData
          .split(',')
          .map((num) => parseFloat(num.trim()))
          .filter((num) => !isNaN(num));

        if (parsedData.length === 0) {
          setError('Ingresa valores numéricos válidos separados por comas.');
          setLoading(false);
          return;
        }

        const data = await statsService.getCentralTendency({ data: parsedData });
        setResult(data);
      } else if (activeTab === 'csv') {
        if (!selectedFile) {
          setError('Selecciona un archivo CSV válido.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('company_id', '1');

        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:8000/api/v1/datasets/upload-csv',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );

        setResult(response.data.metrics_summary || response.data.summary);
        setUploadedDatasetInfo({
          id: response.data.id || response.data.analysis_id,
          name: response.data.dataset_name
        });
      } else if (activeTab === 'database') {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8000/api/v1/statistics/enterprise-metrics?source=${dbSource}&warehouse_id=${warehouseId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setResult(response.data);
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setError('Error al procesar el motor estadístico en el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="p-2 bg-salesia-primary/10 rounded-xl border border-salesia-primary/20">
              <BarChart3 className="w-6 h-6 text-salesia-cyan" />
            </div>
            Motor Estadístico & NumOps
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Análisis numérico avanzado y métricas de tendencia central impulsado por NumPy & Pandas
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-salesia-cyan" />
          <span>Motor Científico v2.4 Activo</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20 flex items-center gap-3 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel de Controles (Izquierda) */}
        <div className="lg:col-span-5 bg-salesia-card border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-5">
            {/* Pestañas de Selección Estilizadas */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('database'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'database'
                    ? 'bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white shadow-lg shadow-salesia-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                ERP DB
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('manual'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'manual'
                    ? 'bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white shadow-lg shadow-salesia-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Manual
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('csv'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'csv'
                    ? 'bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white shadow-lg shadow-salesia-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4">
              {activeTab === 'database' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-salesia-cyan" />
                      Métrica a Procesar (Supabase)
                    </label>
                    <select
                      value={dbSource}
                      onChange={(e) => setDbSource(e.target.value as 'sales' | 'inventory')}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-salesia-cyan transition-colors"
                    >
                      <option value="sales">Ventas Registradas (Sales Total)</option>
                      <option value="inventory">Stock Actual en Almacén (Inventory)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      ID de Sede / Almacén Operativo
                    </label>
                    <input
                      type="number"
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-salesia-cyan font-mono transition-colors"
                      placeholder="1"
                    />
                  </div>
                </div>
              ) : activeTab === 'manual' ? (
                <div className="pt-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-salesia-primary" />
                    Valores numéricos (separados por comas)
                  </label>
                  <textarea
                    rows={5}
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-salesia-cyan font-mono transition-colors resize-none"
                    placeholder="Ej. 150.50, 200.00, 320.40, 110.00"
                  />
                </div>
              ) : (
                <div className="pt-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-salesia-cyan" />
                    Cargar Dataset de Negocio (.CSV)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-xl bg-slate-900/60 transition-all ${
                      isDragging ? 'border-salesia-cyan bg-salesia-cyan/10' : 'border-slate-700 hover:border-salesia-cyan/70'
                    }`}
                  >
                    <div className="space-y-2 text-center">
                      <FileText className="mx-auto h-10 w-10 text-salesia-cyan/70" />
                      <div className="flex text-xs text-slate-400 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-salesia-cyan hover:underline focus-within:outline-none">
                          <span>Sube un archivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".csv"
                            className="sr-only"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1 text-slate-400">o arrástralo</p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">Formatos .CSV hasta 10MB</p>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="mt-3 p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-xs text-slate-200 font-mono truncate">
                        {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white font-medium py-3 rounded-xl hover:opacity-95 transition-all text-sm shadow-lg shadow-salesia-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando con NumPy...
                  </span>
                ) : activeTab === 'database' ? (
                  'Analizar Datos del ERP'
                ) : (
                  'Ejecutar Análisis'
                )}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Auditoría de cumplimiento activada para cada ejecución analítica.</span>
          </div>
        </div>

        {/* Panel de Resultados (Derecha) */}
        <div className="lg:col-span-7 bg-salesia-card border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/60">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-salesia-primary" />
                Resultados del Procesamiento Estadístico
              </h3>
              {activeTab === 'csv' && uploadedDatasetInfo.id && (
                <span className="text-xs font-mono bg-salesia-primary/20 text-salesia-cyan px-3 py-1 rounded-full border border-salesia-cyan/30">
                  Dataset ID: #{uploadedDatasetInfo.id}
                </span>
              )}
            </div>

            {!result ? (
              <div className="text-center py-24 px-4 text-slate-500 text-sm border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30">
                <div className="p-3 bg-slate-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 border border-slate-800">
                  <BarChart3 className="w-6 h-6 text-slate-600" />
                </div>
                <p className="font-medium text-slate-400">Sin análisis activo en pantalla</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Selecciona una fuente de datos en el panel izquierdo y haz clic en analizar para extraer las métricas científicas.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl relative overflow-hidden group hover:border-salesia-cyan/40 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-salesia-cyan/5 rounded-bl-full pointer-events-none" />
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Media / Promedio</span>
                    <p className="text-2xl font-bold text-salesia-cyan mt-1.5 font-mono">
                      {result.mean !== undefined ? Number(result.mean).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl relative overflow-hidden group hover:border-salesia-primary/40 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-salesia-primary/5 rounded-bl-full pointer-events-none" />
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Mediana</span>
                    <p className="text-2xl font-bold text-white mt-1.5 font-mono">
                      {result.median !== undefined ? Number(result.median).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Desv. Estándar ($\sigma$)</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1.5 font-mono">
                      {result.std_dev !== undefined ? Number(result.std_dev).toFixed(2) : 
                       result.std !== undefined ? Number(result.std).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Mínimo</span>
                    <p className="text-xl font-semibold text-slate-200 mt-1 font-mono">
                      {result.min !== undefined ? Number(result.min).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Máximo</span>
                    <p className="text-xl font-semibold text-slate-200 mt-1 font-mono">
                      {result.max !== undefined ? Number(result.max).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Elementos ($N$)</span>
                    <p className="text-xl font-semibold text-salesia-cyan mt-1 font-mono">
                      {result.count !== undefined ? result.count : result.total_rows ?? 'N/A'}
                    </p>
                  </div>
                </div>

                {result.volatility_status && (
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estado de Estabilidad / Riesgo:</span>
                    <span className="font-semibold text-salesia-cyan px-2.5 py-1 bg-salesia-cyan/10 rounded-lg border border-salesia-cyan/20">
                      {result.volatility_status}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center gap-2">
            <span className="text-salesia-cyan font-bold">*</span>
            <span>Nota: Los cálculos se ejecutan empleando librerías científicas del backend para asegurar precisión en la toma de decisiones comerciales.</span>
          </div>
        </div>
      </div>
    </div>
  );
}