import { Receipt, FileText, Eye, Printer, Ban, ShoppingCart, ChevronRight } from 'lucide-react';
import type { Transaction } from '../types/history.types';

interface HistoryTableProps {
  isLoading: boolean;
  data: Transaction[];
  activeTab: 'VENTAS' | 'COTIZACIONES';
  onOpenDetalle: (id: number) => void;
  onOpenAnular: (id: number) => void;
  onCobrarCotizacion: (id: number) => void;
}

export const HistoryTable = ({ isLoading, data, activeTab, onOpenDetalle, onOpenAnular, onCobrarCotizacion }: HistoryTableProps) => {
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <p className="text-slate-400 dark:text-slate-500 font-medium">No se encontraron transacciones.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      
      {/* ==========================================
          VISTA PARA MÓVILES (CARDS RESPONSIVE) 
          ========================================== */}
      <div className="block md:hidden space-y-3">
        {data.map((t) => (
          <div 
            key={t.id} 
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
          >
            <div 
              onClick={() => onOpenDetalle(t.id)}
              className="p-4 active:bg-slate-50 dark:active:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${t.tipoComprobante === 'COTIZACION' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                    {t.tipoComprobante === 'COTIZACION' ? <FileText className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.correlativo}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{t.tipoComprobante}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 dark:text-slate-100 text-sm">S/ {t.totalFinal.toFixed(2)}</p>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border border-transparent dark:border-current/10 ${t.estadoVenta === 'COMPLETADA' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : t.estadoVenta === 'ANULADA' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}>
                    {t.estadoVenta === 'PENDIENTE_COTIZACION' ? 'PENDIENTE' : t.estadoVenta}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold truncate max-w-[200px]">
                    {t.clienteNombre || 'Público General'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(t.fechaVenta).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>
            </div>

            {/* BARRA DE ACCIONES (Celular) */}
            <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 px-3 py-2 flex items-center justify-between transition-colors">
              <div className="flex items-center space-x-1">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenDetalle(t.id); }} 
                  className="p-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenDetalle(t.id); }} 
                  className="p-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
                
                {t.estadoVenta === 'COMPLETADA' && activeTab === 'VENTAS' && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenAnular(t.id); }} 
                    className="p-2 text-red-500 dark:text-red-400 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-lg active:bg-red-50 dark:active:bg-red-950/20 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>

              {activeTab === 'COTIZACIONES' && t.estadoVenta === 'PENDIENTE_COTIZACION' && (
                <div className="flex space-x-1">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenAnular(t.id); }} 
                    className="p-2 text-red-500 dark:text-red-400 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-lg active:bg-red-50 dark:active:bg-red-950/20 transition-colors mr-1"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onCobrarCotizacion(t.id); }}
                    className="flex items-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-black text-[10px] rounded-lg shadow-md active:bg-blue-700 dark:active:bg-blue-500 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1.5" /> COBRAR
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================
          VISTA PARA DESKTOP (TABLA INTEGRAL)
          ========================================== */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Fecha y Hora</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Comprobante</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Cliente</th>
                {activeTab === 'VENTAS' && <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">Pago</th>}
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">Estado</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right">Total</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {new Date(t.fechaVenta).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${t.tipoComprobante === 'COTIZACION' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                        {t.tipoComprobante === 'COTIZACION' ? <FileText className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{t.correlativo}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{t.tipoComprobante}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300 text-xs truncate max-w-[180px]">
                    {t.clienteNombre || 'Público General'}
                  </td>
                  {activeTab === 'VENTAS' && (
                    <td className="py-4 px-6 text-center">
                       {t.pagos && t.pagos.length > 1 ? (
                         <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded text-[9px] font-black border border-transparent dark:border-purple-900/30">MIXTO</span>
                       ) : (
                         <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700">{t.pagos?.[0]?.metodoPago || 'N/A'}</span>
                       )}
                    </td>
                  )}
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border border-transparent dark:border-current/10 ${t.estadoVenta === 'COMPLETADA' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : t.estadoVenta === 'ANULADA' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}>
                      {t.estadoVenta === 'PENDIENTE_COTIZACION' ? 'PENDIENTE' : t.estadoVenta}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-black text-slate-800 dark:text-slate-200 text-sm">
                    S/ {t.totalFinal.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => onOpenDetalle(t.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button type="button" onClick={() => onOpenDetalle(t.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                      
                      {t.estadoVenta === 'COMPLETADA' && activeTab === 'VENTAS' && (
                         <button type="button" onClick={() => onOpenAnular(t.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Ban className="w-4 h-4" /></button>
                      )}

                      {activeTab === 'COTIZACIONES' && t.estadoVenta === 'PENDIENTE_COTIZACION' && (
                        <>
                          <button type="button" onClick={() => onOpenAnular(t.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg mr-1"><Ban className="w-4 h-4" /></button>
                          <button type="button" onClick={() => onCobrarCotizacion(t.id)} className="flex items-center p-2 px-3 bg-primary dark:bg-blue-600 text-white font-black text-[10px] rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 shadow-sm transition-colors border border-transparent"><ShoppingCart className="w-3 h-3 mr-1" /> COBRAR</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};