import { Edit, Trash2, Power, PowerOff, HandCoins, User } from 'lucide-react';
import type { Customer } from '../types/customer.types';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (c: Customer) => void;
  onToggleStatus: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  onPay: (c: Customer) => void;
  onViewProfile?: (c: Customer) => void;
}

export const CustomerTable = ({ customers, isAdmin, onEdit, onToggleStatus, onDelete, onPay, onViewProfile }: CustomerTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto flex-1 custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 sticky top-0 z-10 transition-colors">
          <tr>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Documento</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Estado</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Deuda / Crédito Máx</th>
            <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
              <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">{c.tipoDocumento}:</span> {c.numeroDocumento}
              </td>
              <td className="py-4 px-6">
                <p className="font-bold text-slate-800 dark:text-slate-200">{c.nombreCompleto}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                  {c.telefono && <p className="text-xs text-slate-500 dark:text-slate-400">{c.telefono}</p>}
                  {c.email && <p className="text-xs text-slate-500 dark:text-slate-500">{c.email}</p>}
                </div>
              </td>
              <td className="py-4 px-6 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border border-transparent dark:border-current/10 ${c.estado ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {c.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="py-4 px-6 text-center">
                <div className="flex flex-col items-center">
                  <span className={`font-black text-lg ${c.deudaActual > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                    S/ {c.deudaActual.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Límite: S/ {c.lineaCreditoMaxima.toFixed(2)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center space-x-2">
                  {c.deudaActual > 0 && c.estado && (
                    <button 
                      type="button"
                      onClick={() => onPay(c)} 
                      className="flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white rounded-lg font-bold text-xs transition-colors shadow-sm border border-transparent dark:border-emerald-800/20"
                      title="Registrar Abono"
                    >
                      <HandCoins className="w-4 h-4 mr-1.5" /> PAGAR
                    </button>
                  )}

                  <button type="button" onClick={() => onViewProfile && onViewProfile(c)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Perfil">
                    <User className="w-4 h-4" />
                  </button>

                  <button type="button" onClick={() => onEdit(c)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>

                  {isAdmin && (
                    <>
                      <button type="button" onClick={() => onToggleStatus(c)} className={`p-2 rounded-lg transition-colors ${c.estado ? 'text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`} title={c.estado ? 'Desactivar' : 'Activar'}>
                        {c.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={() => onDelete(c)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};