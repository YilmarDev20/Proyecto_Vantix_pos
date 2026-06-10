import { Edit, Trash2, Power, PowerOff, HandCoins, User } from 'lucide-react';
import type { Customer } from '../types/customer.types';

interface CustomerMobileCardsProps {
  customers: Customer[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (c: Customer) => void;
  onToggleStatus: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  onPay: (c: Customer) => void;
  onViewProfile?: (c: Customer) => void;
}

export const CustomerMobileCards = ({
  customers,
  isLoading,
  isAdmin,
  onEdit,
  onToggleStatus,
  onDelete,
  onPay,
  onViewProfile
}: CustomerMobileCardsProps) => {
  if (isLoading) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        Cargando clientes...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="block md:hidden p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No se encontraron clientes con estos filtros.
      </div>
    );
  }

  return (
    <div className="block md:hidden space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl transition-colors">
      {customers.map((c) => (
        <div 
          key={c.id} 
          className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border flex flex-col gap-3 transition-colors ${
            c.estado ? 'border-slate-200 dark:border-slate-800' : 'border-slate-100 dark:border-slate-850 opacity-70'
          }`}
        >
          {/* Fila superior: Nombre y Estado */}
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{c.nombreCompleto}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                {c.tipoDocumento}: <span className="font-bold">{c.numeroDocumento || 'No registrado'}</span>
              </p>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full shrink-0 border border-transparent dark:border-current/10 ${
              c.estado ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {c.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Fila intermedia: Contacto */}
          {(c.telefono || c.email) && (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850 flex flex-col gap-0.5 transition-colors">
              {c.telefono && <span>📞 {c.telefono}</span>}
              {c.email && <span className="truncate">✉️ {c.email}</span>}
            </div>
          )}

          {/* Bloque Financiero: Deuda y Límite */}
          <div className="grid grid-cols-2 gap-2 text-center p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors">
            <div className="border-r border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Deuda Actual</span>
              <span className={`font-black text-base ${c.deudaActual > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                S/ {c.deudaActual.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Límite Crédito</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                S/ {c.lineaCreditoMaxima.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botonera inferior de acciones */}
          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {c.deudaActual > 0 && c.estado && (
              <button 
                type="button" 
                onClick={() => onPay(c)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                <HandCoins className="w-3.5 h-3.5" /> AMORTIZAR
              </button>
            )}

            <button type="button" onClick={() => onViewProfile && onViewProfile(c)} className="p-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Ver Perfil">
              <User className="w-4 h-4" />
            </button>

            <button type="button" onClick={() => onEdit(c)} className="p-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Editar">
              <Edit className="w-4 h-4" />
            </button>

            {isAdmin && (
              <>
                <button type="button" onClick={() => onToggleStatus(c)} className={`p-2 border rounded-lg transition-colors ${c.estado ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'}`} title={c.estado ? 'Desactivar' : 'Activar'}>
                  {c.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => onDelete(c)} className="p-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar permanentemente">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

        </div>
      ))}
    </div>
  );
};