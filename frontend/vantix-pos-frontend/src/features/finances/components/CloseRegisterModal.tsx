import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { FinancesService } from '../services/finances.api';

interface CloseRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: number;
  onSuccess: () => void;
}

export const CloseRegisterModal = ({ isOpen, onClose, turnoId, onSuccess }: CloseRegisterModalProps) => {
  const [montoDeclarado, setMontoDeclarado] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(montoDeclarado);

    if (isNaN(montoNum) || montoNum < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    try {
      setIsSubmitting(true);
      const resultado = await FinancesService.cerrarCaja(turnoId, {
        montoCierreDeclarado: montoNum
      });
      
      if (resultado.diferencia === 0) {
        toast.success('¡Caja cerrada! Cuadre perfecto (Diferencia S/ 0.00)');
      } else if (resultado.diferencia! < 0) {
        toast.error(`Caja cerrada con FALTANTE de S/ ${Math.abs(resultado.diferencia!).toFixed(2)}`);
      } else {
        toast.info(`Caja cerrada con SOBRANTE de S/ ${resultado.diferencia!.toFixed(2)}`);
      }

      onSuccess();
      onClose();
      setMontoDeclarado('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cierre Ciego de Caja" maxWidth="md">
      <div className="mb-6 bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 transition-colors">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Instrucciones:</strong> Cuenta todo el dinero en efectivo que tienes en la gaveta y escríbelo aquí. El sistema cruzará este valor con las ventas y gastos del día de forma automática.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 text-center text-lg">¿Cuánto efectivo hay en la caja? (S/)</label>
          <input 
            type="number" 
            step="0.10"
            min="0"
            required
            value={montoDeclarado}
            onChange={(e) => setMontoDeclarado(e.target.value)}
            placeholder="Ej: 150.50"
            className="w-full p-4 border-2 border-slate-300 dark:border-slate-750 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none text-center text-3xl font-black bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 gap-2 sm:gap-0 transition-colors">
          <button type="button" onClick={onClose} className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium w-full sm:w-auto border border-slate-200 dark:border-slate-700 transition-colors">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold rounded-xl disabled:opacity-50 w-full sm:w-auto transition-colors"
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Cierre de Turno'}
          </button>
        </div>
      </form>
    </Modal>
  );
};