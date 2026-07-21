import { Modal } from '@/components/ui/Modal'; 
import { useStore } from '@/core/store/context/StoreContext';
import { Calendar, MapPin, Package, ArrowRight, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { TrasladoResponse } from '../types/transfers.types';

interface TransferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  traslado: TrasladoResponse | null;
}

export const TransferDetailsModal = ({ isOpen, onClose, traslado }: TransferDetailsModalProps) => {
  const { stores } = useStore();

  if (!traslado) return null;

  const formatearDetalle = (detalle: any) => {
    const nombreBase = detalle.nombreProducto || 'Producto';
    const marca = detalle.marcaProducto ? ` [${detalle.marcaProducto}]` : '';
    let atributosExtra = '';
    
    if (detalle.atributos && Object.keys(detalle.atributos).length > 0) {
      atributosExtra = ` - ${Object.values(detalle.atributos).join(', ')}`;
    }
    
    return `${nombreBase}${marca}${atributosExtra}`;
  };

  const getStoreName = (id: number) => stores.find(s => s.id === id)?.nombre || 'Desconocido';

  const totalUnidades = traslado.detalles.reduce((acc, item) => acc + item.cantidad, 0);
  const totalTiposProducto = traslado.detalles.length;

  // 🚀 CORREGIDO: Comparación exacta con 'COMPLETADO' según tu type EstadoTraslado
  const isCompletado = traslado.estadoTraslado === 'COMPLETADO';
  const isPendiente = traslado.estadoTraslado === 'PENDIENTE';
  
  const statusColor = isCompletado ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' :
                      isPendiente ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' :
                      'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/50';

  const StatusIcon = isCompletado ? CheckCircle2 :
                     isPendiente ? Clock : XCircle;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('es-PE', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Información del Traslado`}>
      <div className="space-y-5">
        
        {/* CABECERA: Correlativo y Estado */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Correlativo</p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100">{traslado.correlativo}</p>
          </div>
          <div className={`flex items-center px-3 py-1.5 rounded-lg border font-bold text-sm transition-colors ${statusColor}`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {traslado.estadoTraslado}
          </div>
        </div>

        {/* INFO DE RUTA Y FECHAS */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div>
            <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-xs font-bold uppercase">Origen</span>
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{getStoreName(traslado.tiendaOrigenId)}</p>
            <div className="flex items-center mt-2 text-slate-500 dark:text-slate-400 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(traslado.fechaCreacion)}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-4 text-slate-300 dark:text-slate-700">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-xs font-bold uppercase">Destino</span>
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{getStoreName(traslado.tiendaDestinoId)}</p>
            <div className="flex items-center mt-2 text-slate-500 dark:text-slate-400 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {traslado.fechaRecepcion ? formatDate(traslado.fechaRecepcion) : 'En tránsito...'}
            </div>
          </div>
        </div>

        {/* RESUMEN Y LISTA DE PRODUCTOS */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Package className="w-4 h-4 mr-2 text-primary dark:text-blue-400" />
              Detalle de Mercadería
            </p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 transition-colors">
              {totalTiposProducto} items / <span className="text-primary dark:text-blue-400">{totalUnidades} unds. totales</span>
            </p>
          </div>
          
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto">
            {traslado.detalles.map(d => {
              // 🚀 CORREGIDO: Lógica de protección contra campos opcionales del backend
              const factor = d.factorConversion || 1;
              const tienePresentacion = factor > 1 && !!d.presentacionNombre;
              const cantidadEnPresentacion = tienePresentacion ? Math.floor(d.cantidad / factor) : d.cantidad;

              return (
                <li key={d.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatearDetalle(d)}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">SKU: {d.sku}</span>
                      {tienePresentacion && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          (Equivale a {d.cantidad} unds. totales)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-sm">
                      {cantidadEnPresentacion} {tienePresentacion ? d.presentacionNombre : 'und.'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* NOTAS */}
        {traslado.notas ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-sm text-amber-800 dark:text-amber-400 flex items-start transition-colors">
            <FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block mb-0.5">Notas del envío:</span> 
              {traslado.notas}
            </div>
          </div>
        ) : null}

        {/* FOOTER */}
        <div className="flex justify-end pt-2 space-x-3">
          <button type="button" className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-bold transition-colors">
            Imprimir Guía (Próximamente)
          </button>
          
          <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};