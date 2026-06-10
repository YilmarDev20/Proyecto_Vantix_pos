import { Boxes, CheckCircle, XCircle, Tag } from 'lucide-react';

interface ProductKPIsProps {
  total: number;
  activos: number;
  inactivos: number;
  conEtiquetas: number;
}

export const ProductKPIs = ({ total, activos, inactivos, conEtiquetas }: ProductKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg"><Boxes className="w-6 h-6" /></div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Productos</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{total}</h4>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Activos</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{activos}</h4>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg"><XCircle className="w-6 h-6" /></div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Inactivos</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{inactivos}</h4>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg"><Tag className="w-6 h-6" /></div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Con Etiquetas</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{conEtiquetas}</h4>
        </div>
      </div>
    </div>
  );
};