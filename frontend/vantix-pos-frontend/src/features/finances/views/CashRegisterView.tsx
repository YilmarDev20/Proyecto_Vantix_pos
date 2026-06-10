import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Wallet, PlayCircle, Store, ArrowRightLeft, Lock } from 'lucide-react';
import { FinancesService } from '../services/finances.api';
import type { TurnoCajaResponse } from '../types/finances.types';

import { CashMovementModal } from '../components/CashMovementModal';
import { CloseRegisterModal } from '../components/CloseRegisterModal';

import { useStore } from '@/core/store/context/StoreContext';

export const CashRegisterView = () => {
  const { activeStoreId } = useStore();

  const [turnoActivo, setTurnoActivo] = useState<TurnoCajaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [montoApertura, setMontoApertura] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const loadTurno = async () => {
    try {
      setIsLoading(true);
      const tiendaIdQuery = activeStoreId || 1;
      const turno = await FinancesService.getTurnoActivo(tiendaIdQuery);
      setTurnoActivo(turno);
    } catch (error) {
      toast.error('Error al verificar el estado de la caja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTurno();
  }, [activeStoreId]);

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(montoApertura);
    
    if (isNaN(monto) || monto < 0) {
      toast.error('Por favor ingresa un monto válido mayor o igual a 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await FinancesService.abrirCaja({
        montoApertura: monto,
        tiendaId: activeStoreId || 1,
        usuarioId: 1
      });
      toast.success('¡Caja abierta exitosamente! Listo para operar.');
      setMontoApertura('');
      loadTurno();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al abrir la caja');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">Verificando estado de la caja...</div>;

  if (!turnoActivo) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-md w-full text-center transition-colors">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Abrir Turno de Caja</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Para empezar a vender o registrar gastos, necesitas declarar el saldo base (sencillo) con el que inicia la gaveta.
          </p>

          <form onSubmit={handleAbrirCaja} className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monto de Apertura (S/)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">S/</span>
                <input 
                  type="number" 
                  step="0.10"
                  min="0"
                  required
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Abriendo...' : 'Iniciar Turno'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full transition-colors">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">Caja Abierta y Operativa</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Puedes procesar ventas y registrar movimientos.</p>
          </div>
        </div>
        <div className="text-right md:text-right w-full md:w-auto">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Fondo Inicial Declarado</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">S/ {turnoActivo.montoApertura.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full transition-colors">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
              <ArrowRightLeft className="w-5 h-5 mr-2 text-primary dark:text-blue-400" />
              Gastos e Ingresos Extra
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Registra salidas de dinero por limpieza, pasajes, compras rápidas o ingresos de sencillo adicional.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsMovementModalOpen(true)}
            className="w-full py-3 bg-blue-50 dark:bg-blue-950/30 text-primary dark:text-blue-400 font-bold rounded-xl border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            Registrar Nuevo Movimiento
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full transition-colors">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
              Cierre de Turno
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Finaliza el turno actual declarando el efectivo en caja para realizar el cruce del sistema.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsCloseModalOpen(true)}
            className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            Realizar Cierre Ciego
          </button>
        </div>

      </div>

      <CashMovementModal 
        isOpen={isMovementModalOpen} 
        onClose={() => setIsMovementModalOpen(false)} 
        turnoId={turnoActivo.id}
        onSuccess={loadTurno} 
      />

      <CloseRegisterModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)} 
        turnoId={turnoActivo.id}
        onSuccess={loadTurno} 
      />
    </div>
  );
};