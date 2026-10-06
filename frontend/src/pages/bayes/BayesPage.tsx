import React, { useState } from 'react';
import { bayesService, type BayesPayload } from '../../services/bayesService';

export const BayesPage: React.FC = () => {
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
      const payload = {
        prior: Number(formData.prior),
        likelihood: Number(formData.likelihood),
        marginal: Number(formData.marginal),
        hypothesis_description: formData.hypothesis_description,
        evidence_description: formData.evidence_description,
      };

      const data = await bayesService.calculate(payload);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocurrió un error al calcular el Teorema de Bayes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-1">Teorema de Bayes & Probabilidad Condicionada</h1>
      <p className="text-gray-400 mb-6">Cálculo de probabilidad a posteriori para la toma de decisiones comerciales.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Entrada */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Parámetros de Probabilidad</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Probabilidad a Priori P(A) [0 - 1]</label>
              <input
                type="number"
                step="0.01"
                name="prior"
                value={formData.prior}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Verosimilitud P(B|A) [0 - 1]</label>
              <input
                type="number"
                step="0.01"
                name="likelihood"
                value={formData.likelihood}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Probabilidad Marginal P(B) (0 - 1]</label>
              <input
                type="number"
                step="0.01"
                name="marginal"
                value={formData.marginal}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Descripción de Hipótesis</label>
              <input
                type="text"
                name="hypothesis_description"
                value={formData.hypothesis_description}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Descripción de Evidencia</label>
              <input
                type="text"
                name="evidence_description"
                value={formData.evidence_description}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
            >
              {loading ? 'Calculando...' : 'Calcular Probabilidad Posterior'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-4">Resultados del Procesamiento</h2>
            {result ? (
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-sm text-gray-400">Probabilidad Posterior P(A|B):</p>
                  <p className="text-3xl font-bold text-green-400">{result.posterior}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-sm text-gray-400">Porcentaje de Certeza:</p>
                  <p className="text-2xl font-semibold text-blue-400">{result.posterior_percentage}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Ejecute el análisis para visualizar los resultados probabilísticos y almacenarlos automáticamente.</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-6">* Los cálculos son registrados de forma persistente en la base de datos para trazabilidad analítica.</p>
        </div>
      </div>
    </div>
  );
};