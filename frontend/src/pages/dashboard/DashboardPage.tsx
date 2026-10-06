import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { dashboardService, type DashboardSummary } from '../../services/dashboardService';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Error al cargar la información del Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Datos mock/locales de fallback para renderizar gráficos si el endpoint no envía array temporal
  const salesTrendData = [
    { day: 'Lun', ventas: 1200 },
    { day: 'Mar', ventas: 1900 },
    { day: 'Mié', ventas: 1500 },
    { day: 'Jue', ventas: 2200 },
    { day: 'Vie', ventas: 3000 },
    { day: 'Sáb', ventas: 2800 },
    { day: 'Dom', ventas: 1800 },
  ];

  if (loading) return <div style={{ padding: '24px', color: '#fff' }}>Cargando métricas ejecutivas...</div>;
  if (error) return <div style={{ padding: '24px', color: '#ff6b6b' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h2>Dashboard Analytics</h2>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>
        Resumen comercial y métricas estadísticas integradas en tiempo real.
      </p>

      {/* Grid de KPIs Operativos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Ingresos Totales</span>
          <h3 style={cardValueStyle}>S/ {data?.total_revenue?.toFixed(2) || '0.00'}</h3>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Total Ventas</span>
          <h3 style={cardValueStyle}>{data?.total_sales || 0}</h3>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Clientes Activos</span>
          <h3 style={cardValueStyle}>{data?.active_customers || 0}</h3>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Ticket Promedio</span>
          <h3 style={cardValueStyle}>S/ {data?.ticket_promedio?.toFixed(2) || '0.00'}</h3>
        </div>
      </div>

      {/* Grid de Análisis Estadístico (Media vs Mediana) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, borderLeft: '4px solid #0052cc' }}>
          <span style={cardLabelStyle}>Media Aritmética (x̄)</span>
          <h3 style={cardValueStyle}>S/ {data?.mean_sale?.toFixed(2) || '0.00'}</h3>
          <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Venta promedio calculada sobre el total de transacciones.</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #2ecc71' }}>
          <span style={cardLabelStyle}>Mediana</span>
          <h3 style={cardValueStyle}>S/ {data?.median_sale?.toFixed(2) || '0.00'}</h3>
          <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Valor central que separa el 50% superior e inferior de ventas.</p>
        </div>
      </div>

      {/* Sección de Gráficos Estadísticos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '8px', border: '1px solid #2a2a3c' }}>
          <h4 style={{ marginBottom: '16px', color: '#fff' }}>Tendencia de Ventas (Semanal)</h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#252538', borderColor: '#333', color: '#fff' }} />
                <Line type="monotone" dataKey="ventas" stroke="#0052cc" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '8px', border: '1px solid #2a2a3c' }}>
          <h4 style={{ marginBottom: '16px', color: '#fff' }}>Distribución de Ventas por Día</h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#252538', borderColor: '#333', color: '#fff' }} />
                <Bar dataKey="ventas" fill="#2ecc71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sección de Insights Recientes */}
      <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '8px', border: '1px solid #2a2a3c' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Insights Automáticos Recientes</h3>
        {(!data?.recent_insights || data.recent_insights.length === 0) ? (
          <p style={{ color: '#888' }}>No hay insights generados por el motor estadístico aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recent_insights.map((insight) => (
              <div key={insight.id} style={{ background: '#252538', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid #f39c12' }}>
                <strong style={{ display: 'block', color: '#f39c12', marginBottom: '4px' }}>{insight.title}</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#1e1e2d',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #2a2a3c'
};

const cardLabelStyle: React.CSSProperties = {
  color: '#aaa',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '24px',
  margin: '8px 0 0 0',
  fontWeight: 'bold',
  color: '#fff'
};