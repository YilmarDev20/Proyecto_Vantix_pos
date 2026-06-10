import { Edit, Trash2, RefreshCw } from 'lucide-react';
import type { ProveedorResponse } from '../types/purchases.types';

interface SupplierTableProps {
  proveedores: ProveedorResponse[];
  isLoading: boolean;
  onEdit: (prov: ProveedorResponse) => void;
  onDelete: (id: number, nombre: string) => void;
  onReactivar: (id: number, nombre: string) => void;
}

export const SupplierTable = ({ proveedores, isLoading, onEdit, onDelete, onReactivar }: SupplierTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">RUC / DNI</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Razón Social</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contacto</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Teléfono</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {isLoading ? (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando proveedores...</td></tr>
          ) : proveedores.length === 0 ? (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">No se encontraron proveedores.</td></tr>
          ) : (
            proveedores.map((prov) => (
              <tr key={prov.id} className={`transition-colors ${prov.estado ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-red-50/30 dark:bg-red-950/10'}`}>
                <td className="py-3 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{prov.documento}</td>
                <td className="py-3 px-6 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {prov.razonSocial}
                  {!prov.estado && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full uppercase">Inactivo</span>
                  )}
                </td>
                <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{prov.nombreContacto || '-'}</td>
                <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{prov.telefono || '-'}</td>
                <td className="py-3 px-6 text-center space-x-2">
                  {prov.estado ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => onEdit(prov)}
                        className="p-2 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex"
                        title="Editar Proveedor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => onDelete(prov.id, prov.razonSocial)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex"
                        title="Desactivar Proveedor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => onReactivar(prov.id, prov.razonSocial)}
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex font-medium text-sm items-center"
                      title="Volver a Activar"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" /> Activar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};