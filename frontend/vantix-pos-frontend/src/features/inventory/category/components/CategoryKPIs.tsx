import { Tags, Layers, CheckCircle, XCircle } from 'lucide-react';

export const CategoryKPIs = ({ total, principales, subCategorias, inactivas }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Total Categorías', val: total, icon: Tags, bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
        { label: 'Familias Principales', val: principales, icon: Layers, bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400' },
        { label: 'Sub-Categorías', val: subCategorias, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Inactivas', val: inactivas, icon: XCircle, bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400' },
      ].map((kpi, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className={`p-3 ${kpi.bg} ${kpi.text} rounded-lg`}><kpi.icon className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{kpi.label}</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{kpi.val}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};