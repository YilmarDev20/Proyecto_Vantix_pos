import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { FinancesService } from '../services/finances.api';
import type { TipoMovimientoCaja, MetodoPago } from '../types/finances.types';

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: number;
  onSuccess: () => void;
}

export const CashMovementModal = ({ isOpen, onClose, turnoId, onSuccess }: CashMovementModalProps) => {
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoCaja>('EGRESO');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [monto, setMonto] = useState<string>('');
  const [concepto, setConcepto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);

    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!concepto.trim()) {
      toast.error('Debes especificar el motivo o concepto');
      return;
    }

    try {
      setIsSubmitting(true);
      await FinancesService.registrarMovimiento(turnoId, {
        tipoMovimiento,
        metodoPago,
        monto: montoNum,
        concepto,
        usuarioId: 1
      });
      toast.success('Movimiento registrado correctamente');
      onSuccess();
      onClose();
      setMonto('');
      setConcepto('');
      setTipoMovimiento('EGRESO');
      setMetodoPago('EFECTIVO');
    } catch (error) {
      toast.error('Error al registrar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Ingreso / Egreso" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Selector Ingreso / Egreso */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg transition-colors">
          <button
            type="button"
            onClick={() => setTipoMovimiento('EGRESO')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              tipoMovimiento === 'EGRESO' 
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            - Retirar Dinero (Gasto)
          </button>
          <button
            type="button"
            onClick={() => setTipoMovimiento('INGRESO')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              tipoMovimiento === 'INGRESO' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            + Ingresar Dinero
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Monto (S/)</label>
          <input 
            type="number" 
            step="0.10"
            min="0.10"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none text-lg font-bold bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Pago</label>
          <select 
            value={metodoPago} 
            onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          >
            <option value="EFECTIVO">Efectivo (Monedas/Billetes)</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TARJETA">Tarjeta (POS)</option>
            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Motivo / Concepto</label>
          <input 
            type="text" 
            required
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder={tipoMovimiento === 'EGRESO' ? 'Ej: Pasajes, útiles de limpieza, almuerzo' : 'Ej: Sencillo adicional para vuelto'}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-6 py-2 text-white font-bold rounded-lg disabled:opacity-50 transition-colors ${
              tipoMovimiento === 'EGRESO' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar Registro'}
          </button>
        </div>
      </form>
    </Modal>
  );
};