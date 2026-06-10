import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';

interface ClassificationSectionProps {
  categories: { id: number; nombre: string; categoriaPadreId: number | null }[];
}

export const ClassificationSection = ({ categories }: ClassificationSectionProps) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const [tagInput, setTagInput] = useState('');
  
  const etiquetasActuales: string[] = watch('etiquetas') || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toUpperCase();
      if (newTag && !etiquetasActuales.includes(newTag)) {
        setValue('etiquetas', [...etiquetasActuales, newTag], { shouldValidate: true });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('etiquetas', etiquetasActuales.filter(tag => tag !== tagToRemove), { shouldValidate: true });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">Clasificación</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría Principal *</label>
          <select 
            {...register('categoriaId')} 
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          >
            <option value="">-- Selecciona una categoría --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.categoriaPadreId === null ? `🗂️ ${cat.nombre}` : `↳ ${cat.nombre}`}
              </option>
            ))}
          </select>
          {errors.categoriaId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.categoriaId.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Etiquetas (Búsqueda Rápida)</label>
          {/* ✅ ADAPTACIÓN: Input de etiquetas adaptado con bordes oscuros */}
          <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-blue-500 bg-white dark:bg-slate-950 transition-colors">
            <div className="flex flex-wrap gap-2 mb-2">
              {etiquetasActuales.map((tag, idx) => (
                <span key={idx} className="flex items-center bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium border border-blue-200 dark:border-blue-900 transition-colors">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-500 hover:text-red-500 dark:hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full outline-none text-sm bg-transparent dark:text-slate-100" 
              placeholder="Escribe y presiona Enter para agregar..." 
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Ej: PIÑATERIA, OFERTA, VERANO</p>
        </div>
      </div>
    </div>
  );
};