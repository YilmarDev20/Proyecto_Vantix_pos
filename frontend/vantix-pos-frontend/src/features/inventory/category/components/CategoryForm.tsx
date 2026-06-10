import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Category, CategoryRequest } from '../types/category.types';

const categorySchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  codigoPrefijo: z.string().min(2, "Mínimo 2 letras").max(5, "Máximo 5 letras").toUpperCase(),
  categoriaPadreId: z.coerce.number().nullable().optional(), 
  imagenUrl: z.string().optional().nullable(),
});

interface CategoryFormProps {
  initialData?: Category | null;
  categories: Category[];
  onSubmit: (data: CategoryRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CategoryForm = ({ initialData, categories, onSubmit, onCancel, isLoading }: CategoryFormProps) => {
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        codigoPrefijo: initialData.codigoPrefijo,
        categoriaPadreId: initialData.categoriaPadreId || "", 
        imagenUrl: initialData.imagenUrl || ''
      });
    } else {
      reset({ nombre: '', codigoPrefijo: '', categoriaPadreId: "", imagenUrl: '' });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: any) => {
    const payload: CategoryRequest = {
      ...data,
      categoriaPadreId: !data.categoriaPadreId ? null : Number(data.categoriaPadreId)
    };
    onSubmit(payload);
  };

  const parentCandidates = categories.filter(c => c.id !== initialData?.id && c.estado);

  return (
    // CAMBIO: Se mantiene el formulario fluido dentro del modal
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de la Categoría *</label>
        <input 
          type="text" 
          {...register('nombre')} 
          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors" 
          placeholder="Ej: Ropa de Mujer" 
        />
        {errors.nombre && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.nombre.message)}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prefijo (Para Códigos) *</label>
          <input 
            type="text" 
            {...register('codigoPrefijo')} 
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none uppercase bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors" 
            placeholder="Ej: ROP" 
            maxLength={5}
          />
          {errors.codigoPrefijo && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.codigoPrefijo.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pertenece a (Opcional)</label>
          <select 
            {...register('categoriaPadreId')} 
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          >
            <option value="">-- Es Principal --</option>
            {parentCandidates.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          {errors.categoriaPadreId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.categoriaPadreId.message)}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};