import React, { useState } from 'react';
import { bayesService, type BayesPayload } from '../../services/bayesService';
import { Target, ArrowRight, ShieldCheck, Sparkles, Database, Sliders, Cpu } from 'lucide-react';

export const BayesPage: React.FC = () => {
  // Estado para controlar si lee de la BD o es Manual
  const [activeTab, setActiveTab] = useState<'smart' | 'manual'>('smart');
  const [scenario, setScenario] = useState<'conversion' | 'churn'>('conversion');

  // Estado del formulario manual
  const [formData, setFormData] = useState<BayesPayload>({
    prior: 0.2,
    likelihood: 0.85,
    marginal: 0.3,
    hypothesis_description: 'Alta demanda del producto',
    evidence_description: 'Campañas de marketing activas',
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (activeTab === 'smart') {
        // JALA DIRECTAMENTE DE LA BD (Sales, Customers, etc.)
        data = await bayesService.getSmartScenario(scenario);
      } else {
        // CÁLCULO CON VALORES MANUALES
        const payload = {
          prior: Number(formData.prior),
          likelihood: Number(formData.likelihood),
          marginal: Number(formData.marginal),
          hypothesis_description: formData.hypothesis_description,
          evidence_description: formData.evidence_description,
        };
        data = await bayesService.calculate(payload);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocurrió un error al calcular el Teorema de Bayes.');
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
              <Target className="w-6 h-6 text-salesia-cyan" />
            </div>
            Teorema de Bayes & Probabilidad Condicionada
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Motor de inferencia a posteriori para la toma de decisiones gerenciales bajo incertidumbre
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-salesia-cyan" />
          <span>Inferencia Bayesiana v2.0 Activa</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20 flex items-center gap-3 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Entrada (Izquierda) */}
        <div className="lg:col-span-5 bg-salesia-card border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-5">
            {/* Pestañas de Selección Estilizadas */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('smart'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'smart'
                    ? 'bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white shadow-lg shadow-salesia-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                ERP DB (Smart)
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('manual'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'manual'
                    ? 'bg-gradient-to-r from-salesia-primary to-salesia-cyan text-white shadow-lg shadow-salesia-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Simulación Manual
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'smart' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-salesia-cyan" />
                      Caso de Negocio a Evaluar (Supabase)
                    </label>
                    <select
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value as 'conversion' | 'churn')}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-salesia-cyan transition-colors"
                    >
                      <option value="conversion">Conversión de Ventas y Recompras (Sales & Customers)</option>
                      <option value="churn">Riesgo de Fuga de Clientes (Churn Analytics)</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    El backend consultará en tiempo real las tablas transaccionales del ERP para extraer las probabilidades objetivas basadas en tu historial comercial.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Probabilidad a Priori P(A) [0 - 1]</label>
                    <input
                      type="number"
                      step="0.01"
                      name="prior"
                      value={formData.prior}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white font-mono focus:outline-none focus:border-salesia-cyan transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Verosimilitud P(B|A) [0 - 1]</label>
                    <input
                      type="number"
                      step="0.01"
                      name="likelihood"
                      value={formData.likelihood}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white font-mono focus:outline-none focus:border-salesia-cyan transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Probabilidad Marginal P(B) (0 - 1]</label>
                    <input
                      type="number"
                      step="0.01"
                      name="marginal"
                      value={formData.marginal}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white font-mono focus:outline-none focus:border-salesia-cyan transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Descripción de Hipótesis</label>
                    <input
                      type="text"
                      name="hypothesis_description"
                      value={formData.hypothesis_description}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-salesia-cyan transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Descripción de Evidencia</label>
                    <input
                      type="text"
                      name="evidence_description"
                      value={formData.evidence_description}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-salesia-cyan transition-colors"
                    />
                  </div>
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
                    Procesando Bayes con ERP...
                  </span>
                ) : activeTab === 'smart' ? (
                  'Calcular Probabilidad desde ERP'
                ) : (
                  'Calcular Probabilidad Posterior'
                )}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Auditoría e Insights registrados en Supabase (<code className="text-salesia-cyan">bayes_analyses</code>).</span>
          </div>
        </div>

        {/* Resultados (Derecha) */}
        <div className="lg:col-span-7 bg-salesia-card border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/60">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-salesia-primary" />
                Resultados del Procesamiento Probabilístico
              </h3>
            </div>

            {result ? (
              <div className="space-y-4 animate-fadeIn">
                {/* Probabilidad Posterior Principal */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-salesia-cyan/30 p-6 rounded-2xl relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-salesia-cyan/10 rounded-bl-full pointer-events-none blur-xl" />
                  <span className="text-xs font-semibold text-salesia-cyan uppercase tracking-wider block">
                    Probabilidad Posterior P(A|B):
                  </span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-4xl font-extrabold text-white font-mono">
                      {result.posterior_percentage ? `${result.posterior_percentage}%` : result.posterior}
                    </span>
                    <span className="text-sm text-slate-400 font-mono">
                      ({result.posterior})
                    </span>
                  </div>
                </div>

                {/* Parámetros a Priori, Verosimilitud y Marginal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">A Priori P(A)</span>
                    <p className="text-lg font-bold text-white mt-1 font-mono">{result.prior}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Verosimilitud P(B|A)</span>
                    <p className="text-lg font-bold text-white mt-1 font-mono">{result.likelihood}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Marginal P(B)</span>
                    <p className="text-lg font-bold text-white mt-1 font-mono">{result.marginal}</p>
                  </div>
                </div>

                {/* Contexto de la Hipótesis */}
                {(result.hypothesis || result.hypothesis_description) && (
                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Hipótesis Evaluada:</span>
                      <p className="text-slate-200 mt-0.5">{result.hypothesis || result.hypothesis_description}</p>
                    </div>
                    {(result.evidence || result.evidence_description) && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Evidencia Observada:</span>
                        <p className="text-slate-200 mt-0.5">{result.evidence || result.evidence_description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 px-4 text-slate-500 text-sm border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30">
                <div className="p-3 bg-slate-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 border border-slate-800">
                  <Target className="w-6 h-6 text-slate-600" />
                </div>
                <p className="font-medium text-slate-400">Sin análisis probabilístico en pantalla</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Selecciona una opción y ejecuta el análisis para visualizar los resultados probabilísticos y almacenarlos automáticamente.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center gap-2">
            <span className="text-salesia-cyan font-bold">*</span>
            <span>Los cálculos son registrados de forma persistente en la base de datos para trazabilidad analítica.</span>
          </div>
        </div>
      </div>
    </div>
  );
};