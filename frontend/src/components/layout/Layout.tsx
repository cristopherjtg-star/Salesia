import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex h-screen bg-salesia-dark text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
        <Outlet />
      </main>
    </div>
  );
}