import { Outlet } from 'react-router-dom';

export const ReportsLayout = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors animate-in fade-in duration-300">
      {/* CABECERA LIMPIA SIN COMPONENTES HORIZONTALES */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-colors rounded-xl shadow-sm mb-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Inteligencia de Negocios</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Visualiza gráficos, métricas avanzadas, predicciones de stock y rentabilidad real del negocio en tiempo real.
        </p>
      </div>

      {/* ÁREA DINÁMICA */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};