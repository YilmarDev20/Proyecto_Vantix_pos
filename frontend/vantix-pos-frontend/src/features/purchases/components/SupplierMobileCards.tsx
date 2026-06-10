import { Edit, Trash2, RefreshCw } from 'lucide-react';
import type { ProveedorResponse } from '../types/purchases.types';

interface SupplierMobileCardsProps {
  proveedores: ProveedorResponse[];
  isLoading: boolean;
  onEdit: (prov: ProveedorResponse) => void;
  onDelete: (id: number, nombre: string) => void;
  onReactivar: (id: number, nombre: string) => void;
}

export const SupplierMobileCards = ({ proveedores, isLoading, onEdit, onDelete, onReactivar }: SupplierMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        Cargando proveedores...
      </div>
    );
  }

  if (proveedores.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No se encontraron proveedores.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {proveedores.map((prov) => (
        <div 
          key={prov.id} 
          className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border flex flex-col gap-2.5 transition-colors ${
            prov.estado ? 'border-slate-200 dark:border-slate-800' : 'border-red-200 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{prov.razonSocial}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">Doc: {prov.documento}</p>
            </div>
            {!prov.estado && (
              <span className="px-2 py-0.5 text-[9px] font-black bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full uppercase shrink-0">
                Inactivo
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800/60 pt-2 text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Contacto</span>
              <span className="truncate block font-medium">{prov.nombreContacto || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Teléfono</span>
              <span className="truncate block font-semibold">{prov.telefono || '-'}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {prov.estado ? (
              <>
                <button 
                  type="button" 
                  onClick={() => onEdit(prov)} 
                  className="p-2 text-primary dark:text-blue-400 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 rounded-lg transition-colors inline-flex"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => onDelete(prov.id, prov.razonSocial)} 
                  className="p-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:bg-red-100 rounded-lg transition-colors inline-flex"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={() => onReactivar(prov.id, prov.razonSocial)} 
                className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Activar Proveedor
              </button>
            )}
          </div>

        </div>
      ))}
    </div>
  );
};