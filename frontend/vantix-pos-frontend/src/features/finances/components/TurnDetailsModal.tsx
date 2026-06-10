import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { FinancesService } from '../services/finances.api';
import type { MovimientoCajaResponse } from '../types/finances.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TurnDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: number | null;
}

export const TurnDetailsModal = ({ isOpen, onClose, turnoId }: TurnDetailsModalProps) => {
  const [movimientos, setMovimientos] = useState<MovimientoCajaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && turnoId) {
      const loadDetalles = async () => {
        setIsLoading(true);
        try {
          const data = await FinancesService.getMovimientosPorTurno(turnoId);
          setMovimientos(data);
        } catch (error) {
          console.error("Error cargando detalles del turno", error);
        } finally {
          {/* ✅ CORRECCIÓN: Se removió la llamada a 'setIsFalse' inexistente */}
          setIsLoading(false);
        }
      };
      loadDetalles();
    } else {
      setMovimientos([]);
    }
  }, [isOpen, turnoId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Auditoría del Turno #${turnoId || ''}`} maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A continuación se muestran todos los movimientos de efectivo (ingresos y gastos) que ocurrieron durante este turno específico.
        </p>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Hora</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Método</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Concepto</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando movimientos...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">No hubo ingresos ni egresos extra en este turno.</td></tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {format(new Date(mov.fechaMovimiento), "HH:mm", { locale: es })}
                    </td>
                    <td className="py-2 px-4">
                      {mov.tipoMovimiento === 'INGRESO' ? (
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs"><ArrowDownRight className="w-3 h-3 mr-1" /> INGRESO</span>
                      ) : (
                        <span className="flex items-center text-red-600 dark:text-red-400 font-bold text-xs"><ArrowUpRight className="w-3 h-3 mr-1" /> EGRESO</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded border border-transparent dark:border-slate-700">{mov.metodoPago}</span>
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={mov.concepto}>{mov.concepto}</td>
                    <td className={`py-2 px-4 text-right font-bold text-sm ${mov.tipoMovimiento === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {mov.tipoMovimiento === 'INGRESO' ? '+' : '-'} S/ {mov.monto.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cerrar Detalles
          </button>
        </div>
      </div>
    </Modal>
  );
};