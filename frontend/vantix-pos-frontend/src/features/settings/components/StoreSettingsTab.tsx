import { useEffect, useState } from 'react';
import { Plus, Edit, Power, PowerOff, Star } from 'lucide-react';
import { toast } from 'sonner';
import { StoreService } from '@/features/stores/services/stores.api';
import type { Store, StoreRequest } from '@/features/stores/types/stores.types';
import { StoreForm } from './StoreForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const StoreSettingsTab = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const data = await StoreService.getAll();
      setStores(data);
    } catch (error) {
      toast.error('Error al cargar las sucursales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleSaveStore = async (data: StoreRequest) => {
    try {
      setIsSubmitting(true);
      if (selectedStore) {
        await StoreService.update(selectedStore.id, data);
        toast.success('Sucursal actualizada correctamente');
      } else {
        await StoreService.create(data);
        toast.success('Sucursal creada con éxito');
      }
      setIsModalOpen(false);
      loadStores(); 
    } catch (error) {
      toast.error('Ocurrió un error al guardar la sucursal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedStore) return;
    try {
      await StoreService.toggleStatus(selectedStore.id);
      toast.success(`Sucursal ${selectedStore.estado ? 'desactivada' : 'activada'} correctamente`);
      setIsConfirmOpen(false);
      loadStores(); 
    } catch (error) {
      toast.error('Error al cambiar el estado de la sucursal');
    }
  };

  const openEdit = (store: Store) => { setSelectedStore(store); setIsModalOpen(true); };
  const openToggleStatus = (store: Store) => { setSelectedStore(store); setIsConfirmOpen(true); };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Gestión de Sucursales</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Administra los locales físicos de tu negocio.</p>
        </div>
        <button 
          type="button"
          onClick={() => { setSelectedStore(null); setIsModalOpen(true); }}
          className="flex items-center justify-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors text-sm border border-transparent shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Sucursal
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <th className="py-3 px-6">Nombre de Sucursal</th>
              <th className="py-3 px-6">Dirección / Contacto</th>
              <th className="py-3 px-6 text-center">Estado</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {isLoading ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium italic">Cargando sucursales...</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">No hay sucursales registradas.</td></tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id} className={`${store.estado ? 'hover:bg-slate-50 dark:hover:bg-slate-850/40' : 'bg-slate-50/50 dark:bg-slate-950/20 opacity-75'} transition-colors`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{store.nombre}</p>
                      {store.esPrincipal && (
                        <span className="ml-3 flex items-center px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase rounded-md border border-amber-200 dark:border-amber-900/30 shadow-sm transition-colors">
                          <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500 dark:text-amber-400" /> Sede Principal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{store.direccion || 'Sin dirección'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{store.telefono}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent dark:border-current/10 ${store.estado ? 'bg-green-100 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {store.estado ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        type="button"
                        onClick={() => openEdit(store)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                        title="Editar Sucursal"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => openToggleStatus(store)}
                        className={`p-2 rounded-lg transition-colors ${store.estado ? 'text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20' : 'text-slate-400 dark:text-slate-500 hover:text-green-500 dark:hover:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-950/20'}`}
                        title={store.estado ? 'Desactivar' : 'Habilitar'}
                      >
                        {store.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedStore ? 'Editar Sucursal' : 'Nueva Sucursal'}
      >
        <StoreForm 
          initialData={selectedStore} 
          onSubmit={handleSaveStore} 
          onCancel={() => setIsModalOpen(false)} 
          isLoading={isSubmitting} 
        />
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleToggleStatus}
        title="¿Cambiar estado de la sucursal?"
        message={`¿Estás seguro de que deseas ${selectedStore?.estado ? 'desactivar' : 'activar'} la sucursal "${selectedStore?.nombre}"?`}
        confirmText={selectedStore?.estado ? 'Desactivar' : 'Activar'}
        isDestructive={selectedStore?.estado ?? false}
      />
    </div>
  );
};