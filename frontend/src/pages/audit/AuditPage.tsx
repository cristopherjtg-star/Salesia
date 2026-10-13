import React, { useEffect, useState } from 'react';
import { auditService, type AuditLog } from '../../services/auditService';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    auditService.getLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar auditoría:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-white">Cargando registros de auditoría...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Registro de Auditoría</h1>
      <p className="text-gray-400 mb-6">Trazabilidad de acciones críticas y administrativas del sistema.</p>
      
      <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-sm">
              <th className="p-3">ID</th>
              <th className="p-3">Fecha / Hora</th>
              <th className="p-3">Usuario ID</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Tabla</th>
              <th className="p-3">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50 text-sm">
                <td className="p-3">{log.id}</td>
                <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3">{log.user_id || 'Sistema'}</td>
                <td className="p-3 font-semibold text-blue-400">{log.action}</td>
                <td className="p-3 text-yellow-400">{log.table_name}</td>
                <td className="p-3 text-gray-300 font-mono text-xs">
                  {log.details ? JSON.stringify(log.details) : 'N/A'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">No hay registros de auditoría aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};