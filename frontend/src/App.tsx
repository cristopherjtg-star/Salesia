import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Importaciones de Páginas (Sin llaves si son export default)
import Login from './pages/auth/Login';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/dashboard/DashboardPage';
import POSPage from './pages/pos/POSPage';
import InventoryPage from './pages/inventory/InventoryPage';
import CustomerPage from './pages/customers/CustomerPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import { BayesPage } from './pages/bayes/BayesPage';
import { InsightsPage } from './pages/insights/InsightsPage';
import UserPage from './pages/users/UserPage';
import { AuditPage } from './pages/audit/AuditPage';

// Importar ProductsPage como export default
import ProductsPage from './pages/products/ProductsPage'; 
import { ReportsPage } from './pages/reports/reportsPage';
import { SellersPage } from './pages/sellers/sellersPage';
import { BranchesPage } from './pages/branches/BranchesPage';

function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-salesia-dark text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950/40">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen bg-slate-900 dark:bg-salesia-dark flex items-center justify-center text-white">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Operaciones */}
              <Route path="sales" element={<POSPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              
              {/* Analítica */}
              <Route path="statistics" element={<StatisticsPage />} />            
              <Route path="bayes" element={<BayesPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="reports" element={<ReportsPage />} /> {/* <-- NUEVO: Módulo de Reportes */}

              
              {/* Mantenimiento */}
              <Route path="customers" element={<CustomerPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="maintenance/products" element={<ProductsPage />} />
              <Route path="sellers" element={<SellersPage />} /> {/* <-- NUEVO: Vendedores / Personal */}
              <Route path="branches" element={<BranchesPage />} /> {/* <-- NUEVO: Almacenes y Sedes */}
              
              {/* Administración */}
              <Route path="users" element={<UserPage />} />
              <Route path="audit" element={<AuditPage />} />
            </Route>

            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}