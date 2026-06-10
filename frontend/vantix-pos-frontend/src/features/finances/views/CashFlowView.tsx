import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FinancesService } from '../services/finances.api';
import type { MovimientoCajaResponse } from '../types/finances.types';
import { useStore } from '@/core/store/context/StoreContext';

// Fragmentos Visuales
import { CashFlowMobileCards } from '../components/CashFlowMobileCards';
import { CashFlowTable } from '../components/CashFlowTable';

export const CashFlowView = () => {
  const { activeStoreId } = useStore();

  const [movimientos, setMovimientos] = useState<MovimientoCajaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const tiendaIdQuery = activeStoreId || 1;
        const turnoActivo = await FinancesService.getTurnoActivo(tiendaIdQuery);
        
        if (turnoActivo) {
          const data = await FinancesService.getMovimientosPorTurno(turnoActivo.id);
          setMovimientos(data);
        } else {
          setMovimientos([]); 
        }
      } catch (error) {
        toast.error('Error al cargar el flujo de efectivo');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeStoreId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Flujo de Efectivo del Turno Actual</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Detalle de ingresos y egresos registrados durante el día.</p>
        </div>
      </div>

      {/* RENDER MÓVIL DESACOPLADO */}
      <CashFlowMobileCards movimientos={movimientos} isLoading={isLoading} />

      {/* RENDER ESCRITORIO DESACOPLADO */}
      <CashFlowTable movimientos={movimientos} isLoading={isLoading} />
    </div>
  );
};