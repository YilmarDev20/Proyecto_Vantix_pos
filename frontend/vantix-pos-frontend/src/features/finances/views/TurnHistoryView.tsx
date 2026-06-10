import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FinancesService } from '../services/finances.api';
import type { TurnoCajaResponse } from '../types/finances.types';

import { TurnDetailsModal } from '../components/TurnDetailsModal';
import { useStore } from '@/core/store/context/StoreContext';

// Fragmentos Visuales
import { TurnHistoryMobileCards } from '../components/TurnHistoryMobileCards';
import { TurnHistoryTable } from '../components/TurnHistoryTable';

export const TurnHistoryView = () => {
  const { activeStoreId } = useStore();

  const [historial, setHistorial] = useState<TurnoCajaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await FinancesService.getHistorialTurnos(activeStoreId);
      setHistorial(data);
    } catch (error) {
      toast.error('Error al cargar el historial de turnos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStoreId]);

  const handleOpenDetails = (turnoId: number) => {
    setSelectedTurnoId(turnoId);
    setIsModalOpen(true);
  };

  const renderDiferencia = (diferencia: number | null) => {
    if (diferencia === null) return <span className="text-slate-400 dark:text-slate-500">-</span>;
    if (diferencia === 0) return <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded border border-transparent dark:border-emerald-900/30">S/ 0.00 (Cuadrado)</span>;
    if (diferencia < 0) return <span className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded border border-transparent dark:border-red-900/30">S/ {diferencia.toFixed(2)} (Faltante)</span>;
    return <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded border border-transparent dark:border-blue-900/30">+ S/ {diferencia.toFixed(2)} (Sobrante)</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Historial de Turnos y Cuadres</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Auditoría general de aperturas y cierres de caja.</p>
      </div>

      {/* RENDER MÓVIL */}
      <TurnHistoryMobileCards 
        historial={historial}
        isLoading={isLoading}
        renderDiferencia={renderDiferencia}
        onOpenDetails={handleOpenDetails}
      />

      {/* RENDER ESCRITORIO */}
      <TurnHistoryTable 
        historial={historial}
        isLoading={isLoading}
        renderDiferencia={renderDiferencia}
        onOpenDetails={handleOpenDetails}
      />

      <TurnDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        turnoId={selectedTurnoId} 
      />
    </div>
  );
};