import { useState } from 'react';
import { Ban, Printer } from 'lucide-react';
import type { AbonoResponse } from '../types/abono.types';
import type { Customer } from '../types/customer.types';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface ProfilePaymentsTabProps {
  abonos: AbonoResponse[];
  onAnular: (abono: AbonoResponse) => void;
  cliente: Customer; // AHORA RECIBE EL CLIENTE COMPLETO
}

export const ProfilePaymentsTab = ({ abonos, onAnular, cliente }: ProfilePaymentsTabProps) => {
  const [selectedPayment, setSelectedPayment] = useState<AbonoResponse | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  if (abonos.length === 0) {
    return <p className="text-center text-slate-500 py-8">Este cliente no ha realizado abonos.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto animate-in fade-in border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Fecha y Hora</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Método</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center">Estado</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Tickets Cubiertos</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-right">Monto Total</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {abonos.map(a => (
              <tr key={a.id} className={a.estado ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60'}>
                <td className="py-3 px-4 text-sm font-medium text-slate-600">{new Date(a.fechaAbono).toLocaleString('es-PE')}</td>
                <td className="py-3 px-4 font-bold text-slate-700">
                  {a.metodoPago}
                  {a.referencia && <span className="block text-[10px] text-slate-400 font-normal">Ref: {a.referencia}</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${a.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {a.estado ? 'PROCESADO' : 'ANULADO'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {a.detalles?.map(det => (
                      <span key={det.id} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium" title="El sistema descontó este monto de este ticket">
                        {det.correlativoVenta} (S/{det.montoAsignado.toFixed(2)})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-black text-emerald-600">S/ {a.montoTotal.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    
                    <button 
                      onClick={() => { setSelectedPayment(a); setIsReceiptModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                      title="Ver/Imprimir Recibo"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {a.estado && (
                      <button onClick={() => onAnular(a)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Anular Abono">
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaymentReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => { setIsReceiptModalOpen(false); setSelectedPayment(null); }}
        abono={selectedPayment}
        cliente={cliente}
      />
    </>
  );
};