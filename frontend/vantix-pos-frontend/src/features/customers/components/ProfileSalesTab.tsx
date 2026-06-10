import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, ShoppingBag } from 'lucide-react';
import type { VentaResponse } from '@/features/pos/types/pos.types';

interface ProfileSalesTabProps {
  ventas: VentaResponse[];
}

export const ProfileSalesTab = ({ ventas }: ProfileSalesTabProps) => {
  const [showOnlyDebts, setShowOnlyDebts] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // ---> NUEVO: FILTRAMOS LAS COTIZACIONES DEL HISTORIAL FINANCIERO <---
  const ventasReales = ventas.filter(v => v.tipoComprobante !== 'COTIZACION');

  if (ventasReales.length === 0) {
    return <p className="text-center text-slate-500 py-8">Este cliente aún no tiene compras registradas.</p>;
  }

  const filteredVentas = showOnlyDebts 
    ? ventasReales.filter(v => v.saldoPendiente > 0 && v.estadoVenta === 'COMPLETADA')
    : ventasReales;

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-slate-700">Historial de Transacciones</h3>
        <label className="flex items-center cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={showOnlyDebts} onChange={() => setShowOnlyDebts(!showOnlyDebts)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyDebts ? 'bg-red-500' : 'bg-slate-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyDebts ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="ml-3 text-sm font-bold text-slate-600">Solo mostrar deudas pendientes</span>
        </label>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-10"></th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Comprobante</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center">Estado</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-right">Total (S/)</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-right">Deuda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVentas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-slate-500 font-medium">No hay deudas pendientes.</td></tr>
            ) : (
              filteredVentas.map(v => {
                const isDebt = v.saldoPendiente > 0 && v.estadoVenta === 'COMPLETADA';
                const isExpanded = expandedRow === v.id;

                return (
                  <Fragment key={v.id}>
                    <tr 
                      onClick={() => toggleRow(v.id)}
                      className={`cursor-pointer transition-colors ${isDebt ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-600">{new Date(v.fechaVenta).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{v.correlativo}</td>
                      <td className="py-3 px-4 text-center">
                        {v.estadoVenta === 'ANULADA' ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-600">ANULADA</span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${v.estadoPago === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {v.estadoPago}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-700">S/ {v.totalFinal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-black">
                        {isDebt ? (
                          <span className="text-red-600 flex items-center justify-end"><AlertCircle className="w-4 h-4 mr-1"/> S/ {v.saldoPendiente.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-800 border-b-4 border-slate-800">
                        <td colSpan={6} className="p-0">
                          <div className="p-4 animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 flex items-center">
                              <ShoppingBag className="w-4 h-4 mr-2" /> Productos comprados en este ticket
                            </h4>
                            <div className="bg-slate-700 rounded-lg overflow-hidden">
                              <table className="w-full text-left text-sm text-slate-200">
                                <thead>
                                  <tr className="border-b border-slate-600 bg-slate-900/50">
                                    <th className="py-2 px-4 font-semibold">Producto</th>
                                    <th className="py-2 px-4 text-center font-semibold">Cant.</th>
                                    <th className="py-2 px-4 text-right font-semibold">Precio Unit.</th>
                                    <th className="py-2 px-4 text-right font-semibold">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-600">
                                  {v.detalles?.map(det => (
                                    <tr key={det.id} className="hover:bg-slate-600/50 transition-colors">
                                      <td className="py-2 px-4 font-medium text-white">{det.nombreProductoHistorico}</td>
                                      <td className="py-2 px-4 text-center">{det.cantidad}</td>
                                      <td className="py-2 px-4 text-right">S/ {det.precioUnitario.toFixed(2)}</td>
                                      <td className="py-2 px-4 text-right font-bold text-white">S/ {det.subtotal.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};