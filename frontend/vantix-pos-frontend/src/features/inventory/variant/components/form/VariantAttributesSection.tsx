import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

const ATRIBUTOS_ESTANDAR = ['Color', 'Talla', 'Modelo', 'Material', 'Capacidad'];

export const VariantAttributesSection = () => {
  const { register, control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "atributosList" });
  
  const atributosActuales = watch('atributosList') || [];

  const handleAddPredefined = (clave: string) => {
    append({ clave, valor: '' });
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="mb-5">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          1. Elige características (Ej: Color, Talla):
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {ATRIBUTOS_ESTANDAR.map(attr => {
            const isAdded = atributosActuales.some((f: any) => f.clave?.toLowerCase() === attr.toLowerCase());
            return (
              <button
                key={attr} 
                type="button" 
                onClick={() => !isAdded && handleAddPredefined(attr)} 
                disabled={isAdded}
                className={`px-3 py-1.5 border rounded-full text-xs font-bold transition-colors ${
                  isAdded ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-600 hover:border-primary hover:text-primary shadow-sm'
                }`}
              >
                + {attr.toUpperCase()}
              </button>
            );
          })}
          <button 
            type="button" 
            onClick={() => append({ clave: '', valor: '' })} 
            className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-primary hover:bg-blue-100 shadow-sm flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> OTRO
          </button>
        </div>
        
        <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 min-h-[60px]">
          {fields.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">Sin características adicionales.</p>}
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 items-start">
              <div className="flex-1 relative">
                <input {...register(`atributosList.${index}.clave`)} placeholder="Nombre (Ej: Edición)" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary font-medium" />
              </div>
              <div className="flex-1 relative">
                <input {...register(`atributosList.${index}.valor`)} placeholder="Valor (Ej: Limitada)" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};