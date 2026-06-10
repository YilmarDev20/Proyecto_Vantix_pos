import { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, CreditCard, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer } from '../types/customer.types';
import type { MetodoPagoVenta } from '../types/abono.types';

const YapeIcon = () => <span className="font-black text-purple-600 dark:text-purple-400 italic tracking-tighter">yape</span>;
const PlinIcon = () => <span className="font-black text-blue-500 dark:text-blue-400 italic tracking-tighter">plin</span>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Customer | null;
  onConfirm: (monto: number, metodo: MetodoPagoVenta) => Promise<void>;
  isLoading: boolean;
}

export const PaymentModal = ({ isOpen, onClose, cliente, onConfirm, isLoading }: PaymentModalProps) => {
  const [monto, setMonto] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoVenta>('EFECTIVO');

  useEffect(() => {
    if (isOpen) {
      setMonto('');
      setMetodoPago('EFECTIVO');
    }
  }, [isOpen]);

  if (!isOpen || !cliente) return null;

  const deudaActual = cliente.deudaActual || 0;
  const montoIngresado = parseFloat(monto) || 0;
  const nuevoSaldo = deudaActual - montoIngresado;
  
  const esMontoInvalido = montoIngresado <= 0;
  const esMontoExcesivo = montoIngresado > deudaActual;

  const handlePagarTodo = () => {
    setMonto(deudaActual.toString());
  };

  const handleSubmit = () => {
    if (esMontoInvalido) return toast.error('Ingrese un monto válido a pagar.');
    if (esMontoExcesivo) return toast.error('El monto no puede ser mayor a la deuda.');
    
    onConfirm(montoIngresado, metodoPago);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-transparent dark:border-slate-800 transition-colors">
        
        <div className="bg-purple-900 dark:bg-purple-950 p-5 relative text-center border-b border-transparent dark:border-slate-800 transition-colors">
          <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1.5 text-purple-300 hover:text-white hover:bg-purple-800 dark:hover:bg-purple-900 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black text-white flex items-center justify-center">
            <DollarSign className="w-6 h-6 mr-1" /> Registrar Pago
          </h2>
          <p className="text-purple-200 dark:text-purple-300 text-sm mt-1">
            Cliente: <span className="font-bold text-white">{cliente.nombreCompleto}</span>
          </p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Monto a Pagar (S/)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-700 dark:text-slate-300 text-xl">S/</span>
              <input 
                type="number" 
                step="0.10"
                autoFocus
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className={`w-full pl-10 pr-24 py-3 border-2 rounded-xl text-xl font-black outline-none transition-colors ${esMontoExcesivo ? 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50' : 'border-purple-200 dark:border-slate-700 focus:border-purple-600 dark:focus:border-purple-500 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950'}`}
              />
              <button 
                type="button"
                onClick={handlePagarTodo}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                PAGAR TODO
              </button>
            </div>
            {esMontoExcesivo && <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">El pago supera la deuda actual.</p>}
          </div>

          {/* SELECTOR DE MÉTODO DE PAGO */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Método de Pago</label>
            <div className="flex space-x-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl overflow-x-auto transition-colors custom-scrollbar">
              <button type="button" onClick={() => setMetodoPago('EFECTIVO')} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] transition-all ${metodoPago === 'EFECTIVO' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Wallet className="w-4 h-4 mb-1" /> EFECTIVO</button>
              <button type="button" onClick={() => setMetodoPago('YAPE')} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] transition-all ${metodoPago === 'YAPE' ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><div className="mb-1"><YapeIcon /></div> YAPE</button>
              <button type="button" onClick={() => setMetodoPago('PLIN')} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] transition-all ${metodoPago === 'PLIN' ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><div className="mb-1"><PlinIcon /></div> PLIN</button>
              <button type="button" onClick={() => setMetodoPago('TARJETA')} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] transition-all ${metodoPago === 'TARJETA' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><CreditCard className="w-4 h-4 mb-1" /> TARJETA</button>
              {/* ✅ CORREGIDO: Se usa Landmark de forma correcta aquí */}
              <button type="button" onClick={() => setMetodoPago('TRANSFERENCIA')} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] transition-all ${metodoPago === 'TRANSFERENCIA' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Landmark className="w-4 h-4 mb-1" /> TRANSF.</button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm">
              <span className="font-medium">Deuda Actual:</span>
              <span className="font-bold">S/ {deudaActual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 text-sm">
              <span className="font-medium">Abono:</span>
              <span className="font-bold">- S/ {montoIngresado.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
              <span className="font-bold text-slate-700 dark:text-slate-300">Nuevo Saldo:</span>
              <span className={`text-xl font-black ${nuevoSaldo <= 0 ? 'text-emerald-500' : 'text-amber-500 dark:text-amber-400'}`}>
                S/ {Math.max(0, nuevoSaldo).toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium px-4">
            El sistema aplicará este pago automáticamente a los tickets más antiguos (Método FIFO).
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex space-x-3 transition-colors">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || esMontoInvalido || esMontoExcesivo}
            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md text-sm border border-transparent"
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>

      </div>
    </div>
  );
};