import { useEffect, useState } from 'react';
import { Plus, Truck, Search, Eye, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { PurchasesService } from '../services/purchases.api';
import type { ProveedorResponse } from '../types/purchases.types';
import { SupplierModal } from '../components/SupplierModal';

import { KpiCard } from '@/components/ui/KpiCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// Fragmentos Visuales Desacoplados
import { SupplierMobileCards } from '../components/SupplierMobileCards';
import { SupplierTable } from '../components/SupplierTable';

export const SuppliersView = () => {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorResponse | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState<{ id: number; nombre: string } | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await PurchasesService.getProveedores();
      setProveedores(data);
    } catch (error) {
      toast.error('Error al cargar proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (proveedor?: ProveedorResponse) => {
    setProveedorSeleccionado(proveedor || null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, nombre: string) => {
    setProveedorToDelete({ id, nombre });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!proveedorToDelete) return;
    try {
      await PurchasesService.cambiarEstadoProveedor(proveedorToDelete.id, false);
      toast.success('Proveedor desactivado correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al intentar desactivar el proveedor');
    }
  };

  const handleReactivar = async (id: number, nombre: string) => {
    try {
      await PurchasesService.cambiarEstadoProveedor(id, true);
      toast.success(`Proveedor ${nombre} reactivado exitosamente`);
      loadData();
    } catch (error) {
      toast.error('Error al reactivar el proveedor');
    }
  };

  const proveedoresFiltrados = proveedores.filter(prov => {
    const coincideBusqueda = prov.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || prov.documento.includes(searchTerm);
    const coincideEstado = mostrarInactivos ? true : prov.estado === true;
    return coincideBusqueda && coincideEstado;
  });

  const proveedoresActivosCount = proveedores.filter(p => p.estado).length;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ✅ REPARADO: Aquí se usa el icono importado correctamente */}
        <KpiCard
          title="Proveedores Activos"
          value={proveedoresActivosCount}
          icon={Building2}
          colorClass="text-primary bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 rounded-lg hidden md:block transition-colors">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Directorio de Proveedores</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona las empresas que surten mercadería a Zarely.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors w-full md:w-auto shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Proveedor
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar proveedor por Razón Social o RUC/DNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setMostrarInactivos(!mostrarInactivos)}
            className="flex items-center justify-center px-4 py-2 border rounded-lg font-medium transition-colors bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {mostrarInactivos ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {mostrarInactivos ? 'Ocultar Inactivos' : 'Ver Inactivos'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* VISTA TARJETAS MÓVILES */}
        <SupplierMobileCards 
          proveedores={proveedoresFiltrados}
          isLoading={isLoading}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          onReactivar={handleReactivar}
        />

        {/* VISTA TABLA ESCRITORIO */}
        <SupplierTable 
          proveedores={proveedoresFiltrados}
          isLoading={isLoading}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          onReactivar={handleReactivar}
        />
      </div>

      <SupplierModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadData}
        proveedorEditar={proveedorSeleccionado}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Desactivar Proveedor"
        message={`¿Estás seguro de que deseas desactivar al proveedor ${proveedorToDelete?.nombre}? Ya no aparecerá al registrar nuevas compras.`}
        confirmText="Sí, desactivar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
};