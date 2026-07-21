import { X } from 'lucide-react';
import type { Variant } from '../../variant/types/variant.types';

interface LabelPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Variant | null;
  onSelect: (producto: Variant, empaqueSeleccionado?: any) => void;
}

export const LabelPackageModal = ({ isOpen, onClose, producto, onSelect }: LabelPackageModalProps) => {
  if (!isOpen || !producto) return null;

  // 💡 Corrección: Usamos 'presentaciones' que es el nombre real que envía tu DTO de Spring Boot
  const listaPresentaciones = (producto as any).presentaciones || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Seleccionar Formato</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Elige qué etiqueta de barras deseas generar</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wide">
            {producto.productoNombre}
          </p>

          {/* Opción Base: Unidad Suelta */}
          <button 
            onClick={() => onSelect(producto)}
            className="w-full p-4 border-2 border-slate-150 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-left transition-all flex justify-between items-center group bg-white dark:bg-slate-950/40"
          >
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Unidad Suelta</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-mono mt-0.5">
                CB: {producto.codigoBarras || 'Sin código'}
              </span>
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary">
              S/ {producto.precioVenta.toFixed(2)}
            </span>
          </button>

          {/* Opciones por Mayor (Presentaciones de tu Backend) */}
          {listaPresentaciones.map((pres: any) => (
            <button 
              key={pres.id}
              onClick={() => onSelect(producto, pres)}
              className="w-full p-4 border-2 border-primary/20 hover:border-primary bg-primary/5 dark:bg-primary/5 rounded-xl text-left transition-all flex justify-between items-center group"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block capitalize">
                  {pres.nombre} <span className="text-xs font-semibold text-primary-500">(x{pres.factorConversion})</span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block font-mono mt-0.5">
                  CB: {pres.codigoBarras || 'Sin código'}
                </span>
              </div>
              <span className="text-base font-black text-primary-600 dark:text-primary-400">
                S/ {Number(pres.precioVenta).toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        {/* Pie */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-50 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};