import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { PurchasesService } from '../services/purchases.api';
import type { CompraResponse } from '../types/purchases.types';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NewPurchaseView } from '../components/NewPurchaseView';
import { PurchaseDetailsModal } from '../components/PurchaseDetailsModal';

import { PurchaseHistoryKpis } from '../components/PurchaseHistoryKpis';
import { PurchaseHistoryFilters } from '../components/PurchaseHistoryFilters';
import type { PurchaseFiltersConfig } from '../components/PurchaseHistoryFilters';

// Fragmentos Visuales Desacoplados
import { PurchaseHistoryTable } from '../components/PurchaseHistoryTable';
import { PurchaseHistoryMobileCards } from '../components/PurchaseHistoryMobileCards';

import { useStore } from '@/core/store/context/StoreContext';

export const PurchaseHistoryView = () => {
  const { activeStoreId } = useStore();

  const [comprasOriginales, setComprasOriginales] = useState<CompraResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraResponse | null>(null);

  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [compraToCancel, setCompraToCancel] = useState<CompraResponse | null>(null);

  const [filters, setFilters] = useState<PurchaseFiltersConfig>({
    proveedor: '', metodoPago: '', estado: '', fechaInicio: '', fechaFin: ''
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const tiendaIdQuery = activeStoreId || 1;
      const data = await PurchasesService.getHistorialCompras(tiendaIdQuery);
      setComprasOriginales(data);
    } catch (error) {
      toast.error('Error al cargar el historial de compras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isCreating, activeStoreId]);

  const proveedoresUnicos = useMemo(() => {
    const nombres = comprasOriginales.map(c => c.proveedorRazonSocial);
    return Array.from(new Set(nombres)).sort();
  }, [comprasOriginales]);

  const comprasFiltradas = useMemo(() => {
    return comprasOriginales.filter(c => {
      const matchProv = filters.proveedor === '' || c.proveedorRazonSocial === filters.proveedor;
      const matchMetodo = filters.metodoPago === '' || c.metodoPago === filters.metodoPago;
      const matchEstado = filters.estado === '' || c.estadoCompra === filters.estado;
      
      const fechaCompra = new Date(c.fechaCompra);
      const matchInicio = filters.fechaInicio === '' || fechaCompra >= new Date(filters.fechaInicio + 'T00:00:00');
      const matchFin = filters.fechaFin === '' || fechaCompra <= new Date(filters.fechaFin + 'T23:59:59');

      return matchProv && matchMetodo && matchEstado && matchInicio && matchFin;
    });
  }, [comprasOriginales, filters]);

  const handleOpenDetails = (compra: CompraResponse) => {
    setCompraSeleccionada(compra);
    setIsDetailsOpen(true);
  };

  const handleOpenCancelConfirm = (compra: CompraResponse) => {
    setCompraToCancel(compra);
    setIsConfirmCancelOpen(true);
  };

  const confirmCancelPurchase = async () => {
    if (!compraToCancel) return;
    try {
      await PurchasesService.anularCompra(compraToCancel.id);
      toast.success('Factura anulada. El stock ha regresado a la normalidad.');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al intentar anular la compra');
    }
  };

  if (isCreating) {
    return <NewPurchaseView onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <PurchaseHistoryKpis compras={comprasFiltradas} />

      <PurchaseHistoryFilters 
        filters={filters} 
        setFilters={setFilters} 
        proveedoresDisponibles={proveedoresUnicos} 
      />

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Historial de Entradas</h3>
        <button 
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-100 font-bold rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm border border-transparent dark:border-slate-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva Compra
        </button>
      </div>

      {/* ✅ VISTA CELULARES DESACOPLADA */}
      <PurchaseHistoryMobileCards 
        compras={comprasFiltradas}
        isLoading={isLoading}
        onOpenDetails={handleOpenDetails}
        onOpenCancel={handleOpenCancelConfirm}
      />

      {/* ✅ VISTA ESCRITORIO DESACOPLADA */}
      <PurchaseHistoryTable 
        compras={comprasFiltradas} 
        isLoading={isLoading} 
        onOpenDetails={handleOpenDetails} 
        onOpenCancel={handleOpenCancelConfirm} 
      />

      <PurchaseDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} compra={compraSeleccionada} />
      
      <ConfirmDialog
        isOpen={isConfirmCancelOpen} onClose={() => setIsConfirmCancelOpen(false)} onConfirm={confirmCancelPurchase}
        title="Anular Factura de Compra"
        message={`¿Estás seguro de que deseas anular la factura ${compraToCancel?.numeroComprobante}? El stock se descontará del Kardex.`}
        confirmText="Sí, Anular Factura" cancelText="Cancelar" isDestructive={true}
      />
    </div>
  );
};