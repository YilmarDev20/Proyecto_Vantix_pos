import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { TrendingUp, Package, Banknote, ShoppingBag } from 'lucide-react';

export const ReportsLayout = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Ventas y Rentabilidad', path: '/reports/sales', icon: TrendingUp },
    { name: 'Inventario Predictivo', path: '/reports/inventory', icon: Package },
    { name: 'Finanzas y Caja', path: '/reports/finances', icon: Banknote },
    { name: 'Compras y Deudas', path: '/reports/purchases', icon: ShoppingBag },
  ];

  // ---> REDIRECCIÓN AUTOMÁTICA <---
  if (location.pathname === '/reports' || location.pathname === '/reports/dashboard') {
    return <Navigate to="/reports/sales" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* CABECERA Y PESTAÑAS DEL MÓDULO DE REPORTES */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 pt-4 transition-colors">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4">Inteligencia de Negocios</h2>
        
        <nav className="flex space-x-1 overflow-x-auto pb-[-1px] custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ÁREA DINÁMICA DONDE CARGARÁN LOS REPORTES ESPECÍFICOS */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};