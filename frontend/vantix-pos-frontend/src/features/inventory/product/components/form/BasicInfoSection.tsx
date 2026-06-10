import { useFormContext } from 'react-hook-form';

export const BasicInfoSection = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">Información Básica</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Producto *</label>
          <input 
            type="text" 
            {...register('nombre')} 
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors" 
            placeholder="Ej: Escoba de Cerdas Duras" 
          />
          {errors.nombre && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.nombre.message)}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
            <input 
              type="text" 
              {...register('marca')} 
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors" 
              placeholder="Ej: Clorox" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unidad de Medida</label>
            <select 
              {...register('unidadMedida')} 
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
            >
              <option value="NIU">Unidad (NIU)</option>
              <option value="KGM">Kilogramo (KGM)</option>
              <option value="LTR">Litro (LTR)</option>
              <option value="MTR">Metro (MTR)</option>
              <option value="BX">Caja (BX)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
          <textarea 
            {...register('descripcion')} 
            rows={3}
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors" 
            placeholder="Detalles adicionales del producto..." 
          />
        </div>
      </div>
    </div>
  );
};