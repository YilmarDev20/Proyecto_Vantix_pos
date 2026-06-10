import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryService } from '../services/category.api';
import type { Category, CategoryRequest } from '../types/category.types';

// Componentes del submódulo
import { CategoryForm } from '../components/CategoryForm';
import { CategoryKPIs } from '../components/CategoryKPIs';
import { CategoryFilters } from '../components/CategoryFilters';

// Componentes UI globales
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const CategoryView = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Estados de Modales y Acciones
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'toggle'>('delete');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Error al cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (data: CategoryRequest) => {
    try {
      setIsSubmitting(true);
      if (selectedCategory) {
        await CategoryService.update(selectedCategory.id, data);
        toast.success('Categoría actualizada');
      } else {
        await CategoryService.create(data);
        toast.success('Categoría creada');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error('Error al guardar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedCategory) return;
    try {
      if (actionType === 'delete') {
        await CategoryService.delete(selectedCategory.id);
        toast.success('Categoría eliminada permanentemente');
      } else if (actionType === 'toggle') {
        await CategoryService.toggleStatus(selectedCategory.id);
        toast.success(`Categoría ${selectedCategory.estado ? 'desactivada' : 'activada'}`);
      }
      setIsConfirmOpen(false);
      loadCategories();
    } catch (error: any) {
      if (actionType === 'delete') {
        toast.error('No se puede eliminar. Tiene productos asociados.');
      } else {
        toast.error('Error al procesar la solicitud');
      }
      setIsConfirmOpen(false);
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.nombre : '-';
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = 
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cat.codigoPrefijo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ? true : statusFilter === 'active' ? cat.estado === true : cat.estado === false;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      <CategoryKPIs 
        total={categories.length}
        principales={categories.filter(c => c.categoriaPadreId === null).length}
        subCategorias={categories.filter(c => c.categoriaPadreId !== null).length}
        inactivas={categories.filter(c => !c.estado).length}
      />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Catálogo de Familias</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Organiza tu inventario para búsquedas y reportes.</p>
          </div>
          <button 
            type="button"
            onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Categoría
          </button>
        </div>

        <CategoryFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Prefijo</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoría Padre</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Estado</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando catálogo...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">No hay registros que coincidan.</td></tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className={`transition-colors ${cat.estado ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-slate-50 dark:bg-slate-950/40 opacity-75'}`}>
                    <td className="py-3 px-6 text-sm font-bold text-slate-800 dark:text-slate-200">{cat.nombre}</td>
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs">{cat.codigoPrefijo}</span></td>
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{cat.categoriaPadreId === null ? <span className="text-slate-400 dark:text-slate-600 italic">-- Principal --</span> : getParentName(cat.categoriaPadreId)}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.estado ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {cat.estado ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm flex items-center justify-center space-x-2">
                      <button type="button" onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => { setSelectedCategory(cat); setActionType('toggle'); setIsConfirmOpen(true); }} className={`p-2 rounded-lg transition-colors ${cat.estado ? 'text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800' : 'text-slate-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800'}`}>
                        {cat.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={() => { setSelectedCategory(cat); setActionType('delete'); setIsConfirmOpen(true); }} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}>
        <CategoryForm initialData={selectedCategory} categories={categories} onSubmit={handleSaveCategory} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleConfirmAction}
        title={actionType === 'delete' ? 'Eliminar Categoría' : 'Cambiar Estado'}
        message={actionType === 'delete' ? `¿Estás seguro de eliminar permanentemente "${selectedCategory?.nombre}"?` : `¿Deseas ${selectedCategory?.estado ? 'desactivar' : 'activar'} la categoría "${selectedCategory?.nombre}"?`}
        confirmText={actionType === 'delete' ? 'Eliminar' : (selectedCategory?.estado ? 'Desactivar' : 'Activar')}
        isDestructive={actionType === 'delete' || (selectedCategory?.estado ?? false)}
      />
    </div>
  );
};