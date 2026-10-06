import React, { useEffect, useState } from 'react';
import { insightService, type Insight } from '../../services/insightService';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await insightService.getInsights();
        setInsights(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Error al cargar los insights automáticos.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getImpactBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return <span className="bg-red-900 text-red-300 px-2 py-1 rounded text-xs font-semibold">Crítico</span>;
      case 'WARNING':
        return <span className="bg-yellow-900 text-yellow-300 px-2 py-1 rounded text-xs font-semibold">Advertencia</span>;
      default:
        return <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs font-semibold">Información</span>;
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando insights...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-1">Insights Automáticos IA</h1>
      <p className="text-gray-400 mb-6">Diagnósticos de negocio, anomalías y recomendaciones generadas por el sistema.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {insights.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center text-gray-400">
          No hay insights registrados en la base de datos actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((item) => (
            <div key={item.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400 font-mono">#{item.code}</span>
                  {getImpactBadge(item.impact_level)}
                </div>
                <h2 className="text-lg font-semibold mb-2 text-slate-100">{item.title}</h2>
                <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                
                {item.evidence_data && (
                  <div className="bg-gray-900 p-3 rounded border border-gray-800 text-xs text-gray-400 font-mono mb-4 overflow-x-auto">
                    <pre>{JSON.stringify(item.evidence_data, null, 2)}</pre>
                  </div>
                )}
              </div>

              <div className="text-right text-xs text-gray-500 pt-2 border-t border-gray-700">
                Generado: {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};