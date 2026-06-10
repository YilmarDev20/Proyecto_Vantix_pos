import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { AppUser, AppUserRequest } from '../../users/types/users.types';
import type { Store } from '@/features/stores/types/stores.types';

const getUserSchema = (isCreating: boolean) => z.object({
  nombre: z.string().min(3, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: isCreating 
    ? z.string().min(6, "La contraseña es obligatoria (Mín. 6 caracteres)")
    : z.string().optional().or(z.literal('')),
  rol: z.string().min(1, "Seleccione un rol"), 
  tiendaId: z.coerce.number().min(1, "Seleccione una sucursal")
});

interface UserFormProps {
  initialData?: AppUser | null;
  stores: Store[];
  onSubmit: (data: AppUserRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const UserForm = ({ initialData, stores, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const isCreating = !initialData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(getUserSchema(isCreating)),
    defaultValues: { nombre: '', email: '', password: '', rol: 'ROLE_SELLER', tiendaId: '' }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        email: initialData.email,
        password: '', 
        rol: initialData.rol,
        tiendaId: initialData.tiendaId
      });
    } else {
      reset({ nombre: '', email: '', password: '', rol: 'ROLE_SELLER', tiendaId: '' });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as AppUserRequest))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
          <input type="text" {...register('nombre')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" placeholder="Ej: Fredy Cajero" />
          {errors.nombre && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.nombre.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico *</label>
          <input type="email" {...register('email')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" placeholder="fredy@zarely.com" />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.email.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Contraseña {initialData ? '(Opcional para cambiar)' : '*'}
          </label>
          <input type="password" {...register('password')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" placeholder="••••••••" />
          {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.password.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol en el Sistema *</label>
          <select {...register('rol')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm">
            <option value="ROLE_SELLER">Cajero (Vendedor)</option>
            <option value="ROLE_ADMIN">Administrador Global</option>
          </select>
          {errors.rol && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.rol.message)}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sucursal Asignada *</label>
        <select {...register('tiendaId')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm">
          <option value="">-- Seleccione una sucursal --</option>
          {stores.filter(s => s.estado).map(store => (
            <option key={store.id} value={store.id}>{store.nombre}</option>
          ))}
        </select>
        {errors.tiendaId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.tiendaId.message)}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">Cancelar</button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors text-sm border border-transparent shadow-sm">
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
};