import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { StoreIcon } from 'lucide-react';
import type { Store, StoreRequest } from '@/features/stores/types/stores.types';

const storeSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  mensajeTicket: z.string().optional(),
  esPrincipal: z.boolean().optional() 
});

interface StoreFormProps {
  initialData?: Store | null;
  onSubmit: (data: StoreRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const StoreForm = ({ initialData, onSubmit, onCancel, isLoading }: StoreFormProps) => {
  // ✅ REPARADO: Se eliminó la variable 'isCreating' que no se leía para limpiar el error ts(6133)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      mensajeTicket: '',
      esPrincipal: false
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        mensajeTicket: initialData.mensajeTicket || '',
        esPrincipal: initialData.esPrincipal || false 
      });
    } else {
      reset({ nombre: '', direccion: '', telefono: '', mensajeTicket: '', esPrincipal: false });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: any) => {
    const payload: StoreRequest = {
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono,
      mensajeTicket: data.mensajeTicket,
      esPrincipal: !!data.esPrincipal 
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de la Sucursal *</label>
        <input 
          type="text" 
          {...register('nombre')} 
          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" 
          placeholder="Ej: Local Pisco Principal" 
        />
        {errors.nombre && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.nombre.message)}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
        <input 
          type="text" 
          {...register('direccion')} 
          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" 
          placeholder="Ej: Av. Las Américas 123" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono de Contacto</label>
        <input 
          type="text" 
          {...register('telefono')} 
          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" 
          placeholder="Ej: 987 654 321" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mensaje para el Ticket (Pie de página)</label>
        <textarea 
          {...register('mensajeTicket')} 
          rows={3} 
          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" 
          placeholder="Ej: ¡Gracias por tu compra en Zarely Moda & Accesorios! Vuelve pronto." 
        />
      </div>

      <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg mt-2 transition-colors">
        <input 
          type="checkbox" 
          id="esPrincipal"
          {...register('esPrincipal')} 
          className="w-5 h-5 text-amber-600 dark:text-amber-500 rounded border-amber-300 dark:border-slate-700 focus:ring-amber-500 dark:bg-slate-950 cursor-pointer transition-colors"
        />
        <label htmlFor="esPrincipal" className="ml-3 text-sm font-bold text-amber-800 dark:text-amber-300 cursor-pointer flex items-center select-none transition-colors">
          <StoreIcon className="w-4 h-4 mr-1.5" />
          Establecer como Sede Principal (Matriz)
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors text-sm border border-transparent shadow-sm">
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar Sucursal' : 'Crear Sucursal'}
        </button>
      </div>
    </form>
  );
};