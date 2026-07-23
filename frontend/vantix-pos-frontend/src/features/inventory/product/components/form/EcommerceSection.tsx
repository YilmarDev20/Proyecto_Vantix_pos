import { useFormContext } from 'react-hook-form';
import { Globe } from 'lucide-react';

export const EcommerceSection = () => {
  const { register, watch } = useFormContext();
  const publicadoEnWeb = watch('publicadoEnWeb');

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center">
        <Globe className="w-4 h-4 mr-2 text-indigo-500" /> Visibilidad E-Commerce
      </h3>

      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Publicar en Catálogo Web</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {publicadoEnWeb 
              ? 'Este producto maestro y sus variantes activas serán visibles en la tienda online.' 
              : 'El producto permanecerá oculto únicamente en el catálogo web.'}
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            {...register('publicadoEnWeb')} 
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
        </label>
      </div>
    </div>
  );
};