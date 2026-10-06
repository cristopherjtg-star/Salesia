import { useState } from 'react';
import { statsService } from '../../services/statsService';
import { BarChart3, Calculator, Activity, ArrowRight, Upload, FileText, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [inputData, setInputData] = useState<string>('12, 15, 14, 22, 18, 19, 25, 30, 14, 21');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedDatasetInfo, setUploadedDatasetInfo] = useState<{ id?: number; name?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Manejadores para Arrastrar y Soltar (Drag & Drop)
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
          setError('Ingresa al menos un número válido separado por comas.');
          setLoading(false);
          return;
        }

        const data = await statsService.getCentralTendency({ data: parsedData });
        setResult(data);
      } else {
        if (!selectedFile) {
          setError('Selecciona un archivo CSV válido.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('company_id', '1'); // ID de empresa por defecto

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

        // Guardamos las métricas y la información del registro en DB
        setResult(response.data.metrics_summary || response.data.summary);
        setUploadedDatasetInfo({
          id: response.data.id || response.data.analysis_id,
          name: response.data.dataset_name
        });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-salesia-cyan" />
          Motor Estadístico & NumOps
        </h1>
        <p className="text-sm text-slate-400">Análisis numérico y de tendencia central impulsado por NumPy y Pandas</p>
      </div>

      {error && <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Entrada de Datos */}
        <div className="bg-salesia-card border border-slate-800 rounded-xl p-6 h-fit shadow-xl">
          {/* Selector de Pestañas Manual / CSV */}
          <div className="flex bg-slate-900 p-1 rounded-lg mb-4 border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setActiveTab('manual'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'manual' ? 'bg-salesia-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('csv'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'csv' ? 'bg-salesia-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Archivo CSV
            </button>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            {activeTab === 'manual' ? (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-salesia-primary" />
                  Valores numéricos (separados por comas)
                </label>
                <textarea
                  rows={4}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-salesia-primary font-mono"
                  placeholder="Ej. 10, 20, 30, 40"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-salesia-cyan" />
                  Cargar Dataset de Negocio (.CSV)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg bg-slate-900/50 transition ${
                    isDragging ? 'border-salesia-cyan bg-salesia-cyan/10' : 'border-slate-700 hover:border-salesia-cyan'
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-10 w-10 text-slate-400" />
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
                      <p className="pl-1">o arrástralo</p>
                    </div>
                    <p className="text-[10px] text-slate-500">Formato CSV hasta 10MB</p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mt-3 p-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-2">
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
              className="w-full bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : activeTab === 'manual' ? 'Ejecutar Análisis' : 'Subir y Analizar CSV'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-2 bg-salesia-card border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-salesia-primary" />
                Resultados del Procesamiento
              </h3>
              {activeTab === 'csv' && uploadedDatasetInfo.id && (
                <span className="text-xs font-mono bg-salesia-primary/20 text-salesia-cyan px-2.5 py-1 rounded-full border border-salesia-cyan/30">
                  Dataset ID: #{uploadedDatasetInfo.id}
                </span>
              )}
            </div>

            {!result ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Ejecuta el análisis manual o sube un dataset CSV para visualizar las métricas estadísticas calculadas por el servidor.
              </div>
            ) : activeTab === 'manual' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Media Aritmética</span>
                  <p className="text-2xl font-bold text-salesia-cyan mt-1">
                    {result.mean !== undefined ? Number(result.mean).toFixed(2) : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Mediana</span>
                  <p className="text-2xl font-bold text-white mt-1">
                    {result.median !== undefined ? Number(result.median).toFixed(2) : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Desviación Estándar</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {result.std !== undefined ? Number(result.std).toFixed(2) : 
                     result.std_dev !== undefined ? Number(result.std_dev).toFixed(2) : 
                     result.standard_deviation !== undefined ? Number(result.standard_deviation).toFixed(2) : 
                     (result as any).desv !== undefined ? Number((result as any).desv).toFixed(2) : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Total de Filas</span>
                    <p className="text-xl font-bold text-salesia-cyan mt-1">{result.total_rows ?? 'N/A'}</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Total de Columnas</span>
                    <p className="text-xl font-bold text-white mt-1">{result.total_columns ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Resumen Estadístico Guardado (JSON)</span>
                  <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-48 p-2 bg-slate-950 rounded">
                    {JSON.stringify(result.descriptive_stats || result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-400">
            * Nota: Los cálculos se ejecutan empleando las librerías científicas del backend para asegurar precisión en la toma de decisiones comerciales.
          </div>
        </div>
      </div>
    </div>
  );
}