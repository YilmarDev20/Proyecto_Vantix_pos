import { useEffect, useState } from 'react';
import { Plus, Edit, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import type { AppUser, AppUserRequest } from '@/features/users/types/users.types';
import type { Store } from '@/features/stores/types/stores.types';
import { StoreService } from '@/features/stores/services/stores.api'; 
import { UserForm } from './UserForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserService } from '@/features/users/services/users.api';

export const UserSettingsTab = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, storesData] = await Promise.all([UserService.getAll(), StoreService.getAll()]);
      setUsers(usersData);
      setStores(storesData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data: AppUserRequest) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) await UserService.update(selectedUser.id, data);
      else await UserService.create(data);
      
      toast.success(`Usuario ${selectedUser ? 'actualizado' : 'creado'} correctamente`);
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      await UserService.toggleStatus(selectedUser.id);
      toast.success('Estado del usuario actualizado');
      setIsConfirmOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Directorio de Personal</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Administra los accesos de cajeros y administradores.</p>
        </div>
        <button 
          type="button"
          onClick={() => { setSelectedUser(null); setIsModalOpen(true); }} 
          className="flex items-center justify-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors text-sm border border-transparent shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <th className="py-3 px-6">Personal</th>
              <th className="py-3 px-6">Rol</th>
              <th className="py-3 px-6">Sucursal Base</th>
              <th className="py-3 px-6 text-center">Estado</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium italic">Cargando catálogo de personal...</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className={user.estado ? 'hover:bg-slate-50 dark:hover:bg-slate-850/40' : 'bg-slate-50/50 dark:bg-slate-950/20 opacity-70'}>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.nombre}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {user.rol === 'ROLE_ADMIN' ? 'Administrador' : 'Cajero'}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{user.tiendaNombre}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent dark:border-current/10 ${user.estado ? 'bg-green-100 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {user.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button type="button" onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button type="button" onClick={() => { setSelectedUser(user); setIsConfirmOpen(true); }} className={`p-2 rounded-lg transition-colors ${user.estado ? 'text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}>
                        {user.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <UserForm initialData={selectedUser} stores={stores} onSubmit={handleSave} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleToggleStatus}
        title="¿Cambiar estado?" message={`¿Deseas ${selectedUser?.estado ? 'desactivar' : 'activar'} el acceso de "${selectedUser?.nombre}"?`}
        confirmText={selectedUser?.estado ? 'Desactivar' : 'Activar'} isDestructive={selectedUser?.estado ?? false}
      />
    </div>
  );
};