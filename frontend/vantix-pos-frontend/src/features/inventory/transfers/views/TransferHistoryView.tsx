import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '@/core/auth/context/AuthContext';
import { TransfersService } from '../services/transfers.api';
import type { TrasladoResponse, EstadoTraslado } from '../types/transfers.types';

import { TransferKPIs } from '../components/TransferKPIs';
import { TransferFilters } from '../components/TransferFilters';
import { TransferDetailsModal } from '../components/TransferDetailsModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// Importamos los dos nuevos fragmentos visuales desacoplados
import { TransferHistoryMobileCards } from '../components/TransferHistoryMobileCards';
import { TransferHistoryTable } from '../components/TransferHistoryTable';

export const TransferHistoryView = () => {
  const { activeStoreId, stores } = useStore();
  const { user } = useAuth();

  const [traslados, setTraslados] = useState<TrasladoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<EstadoTraslado | 'TODOS'>('TODOS');
  const [filterType, setFilterType] = useState<'TODOS' | 'ENTRANTES' | 'SALIENTES'>('TODOS');

  const [selectedTraslado, setSelectedTraslado] = useState<TrasladoResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'accept' | 'reject', id: number } | null>(null);

  const loadTraslados = async () => {
    if (!activeStoreId) return;
    try {
      setIsLoading(true);
      const data = await TransfersService.obtenerHistorial(activeStoreId);
      setTraslados(data);
    } catch (error) {
      toast.error('Error al cargar el historial de traslados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTraslados(); }, [activeStoreId]);

  const handleAction = async () => {
    if (!confirmAction) return;
    const userId = user?.id || 1;
    
    try {
      if (confirmAction.type === 'accept') {
        await TransfersService.aceptarTraslado(confirmAction.id, userId);
        toast.success('Mercadería recibida correctamente.');
      } else {
        await TransfersService.rechazarTraslado(confirmAction.id, userId);
        toast.success('Traslado anulado. El stock regresó a su origen.');
      }
      setConfirmAction(null);
      loadTraslados();
    } catch (error) {
      toast.error('Ocurrió un error al procesar la acción.');
    }
  };

  const getStoreName = (id: number) => stores.find(s => s.id === id)?.nombre || 'Desconocido';

  const filteredTraslados = traslados.filter(t => {
    const matchStatus = filterStatus === 'TODOS' || t.estadoTraslado === filterStatus;
    const matchType = filterType === 'TODOS' || 
                      (filterType === 'ENTRANTES' && t.tiendaDestinoId === activeStoreId) ||
                      (filterType === 'SALIENTES' && t.tiendaOrigenId === activeStoreId);
    return matchStatus && matchType;
  });

  return (
    <div className="flex flex-col h-full">
      <TransferKPIs traslados={traslados} activeStoreId={activeStoreId as number} />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col flex-1 min-h-0 transition-colors">
        
        <TransferFilters 
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterType={filterType} setFilterType={setFilterType} 
        />

        {/* ✅ ADAPTACIÓN MÓVIL: Renderizado de tarjetas verticales independientes para celulares */}
        <TransferHistoryMobileCards 
          traslados={filteredTraslados}
          isLoading={isLoading}
          activeStoreId={activeStoreId as number}
          getStoreName={getStoreName}
          onOpenDetails={(t) => { setSelectedTraslado(t); setIsDetailsOpen(true); }}
          onAction={(type, id) => setConfirmAction({ type, id })}
        />

        {/* ✅ ADAPTACIÓN ESCRITORIO: Renderizado de tabla clásica horizontal independiente para PCs */}
        <TransferHistoryTable 
          traslados={filteredTraslados}
          isLoading={isLoading}
          activeStoreId={activeStoreId as number}
          getStoreName={getStoreName}
          onOpenDetails={(t) => { setSelectedTraslado(t); setIsDetailsOpen(true); }}
          onAction={(type, id) => setConfirmAction({ type, id })}
        />
        
      </div>

      <TransferDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} traslado={selectedTraslado} />
      
      <ConfirmDialog 
        isOpen={confirmAction !== null} onClose={() => setConfirmAction(null)} onConfirm={handleAction}
        title={confirmAction?.type === 'accept' ? '¿Recibir Mercadería?' : '¿Anular Traslado?'}
        message={confirmAction?.type === 'accept' ? 'Los productos ingresarán al stock local.' : 'El stock regresará a la tienda de origen.'}
        confirmText={confirmAction?.type === 'accept' ? 'Sí, Recibir' : 'Sí, Anular'}
        isDestructive={confirmAction?.type === 'reject'}
      />
    </div>
  );
};