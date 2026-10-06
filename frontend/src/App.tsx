import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Sidebar from './components/layout/Sidebar';
import POSPage from './pages/pos/POSPage';
import InventoryPage from './pages/inventory/InventoryPage';
import CustomerPage from './pages/customers/CustomerPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import { BayesPage } from './pages/bayes/BayesPage';
import { InsightsPage } from './pages/insights/InsightsPage';
import UserPage from './pages/users/UserPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import { AuditPage } from './pages/audit/AuditPage'; // <-- 1. Importar la página de auditoría

import { Outlet } from 'react-router-dom';
import { type ReactNode } from 'react';

function Layout() {
  return (
    <div className="flex h-screen bg-salesia-dark text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen bg-salesia-dark flex items-center justify-center text-white">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="statistics" element={<StatisticsPage />} />            
            <Route path="bayes" element={<BayesPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="audit" element={<AuditPage />} /> {/* <-- 2. Agregar la ruta protegida */}
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}