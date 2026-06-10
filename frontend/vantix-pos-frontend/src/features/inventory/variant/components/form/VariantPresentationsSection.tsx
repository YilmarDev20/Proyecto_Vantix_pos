import { useFormContext, useFieldArray } from 'react-hook-form';
import { Package, Plus, Trash2 } from 'lucide-react';

export const VariantPresentationsSection = () => {
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "presentacionesList" });

  return (
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-purple-900 flex items-center">
          <Package className="w-4 h-4 mr-2" /> Empaques y Ventas por Mayor
        </h4>
        <button 
          type="button" 
          onClick={() => append({ nombre: '', codigoBarras: '', factorConversion: 2, precioVenta: 0 })}
          className="text-xs font-bold bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 flex items-center transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" /> Añadir Empaque
        </button>
      </div>

      <div className="space-y-3">
        {fields.length === 0 && (
          <p className="text-xs text-purple-600/70 italic text-center py-2">
            Si este producto se vende en cajas o docenas, añádelo aquí.
          </p>
        )}
        
        {fields.map((field, index) => (
          <div key={field.id} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm relative">
            <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            
            <div className="grid grid-cols-2 gap-3 pr-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre (Ej: Caja x12)</label>
                <input {...register(`presentacionesList.${index}.nombre`)} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500" placeholder="Nombre..." />
                {(errors?.presentacionesList as any)?.[index]?.nombre && <span className="text-[10px] text-red-500">Requerido</span>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Código de Barras (Caja)</label>
                <input {...register(`presentacionesList.${index}.codigoBarras`)} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500" placeholder="Pistolear caja..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unidades que trae</label>
                <input type="number" step="any" {...register(`presentacionesList.${index}.factorConversion`)} className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-purple-700 outline-none focus:border-purple-500" />
                {(errors?.presentacionesList as any)?.[index]?.factorConversion && <span className="text-[10px] text-red-500">Requerido</span>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Precio de Venta</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">S/</span>
                  <input type="number" step="any" {...register(`presentacionesList.${index}.precioVenta`)} className="w-full p-2 pl-7 border border-slate-300 rounded-lg text-sm font-bold text-emerald-600 outline-none focus:border-purple-500" />
                </div>
                {(errors?.presentacionesList as any)?.[index]?.precioVenta && <span className="text-[10px] text-red-500">Requerido</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};