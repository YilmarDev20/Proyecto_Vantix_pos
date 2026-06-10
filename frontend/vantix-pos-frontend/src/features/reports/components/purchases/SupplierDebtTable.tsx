import { AlertCircle, Building2 } from 'lucide-react';
import type { DeudaProveedor } from '../../types/purchases.types';

interface Props {
  deudas: DeudaProveedor[];
}

export const SupplierDebtTable = ({ deudas }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 transition-colors">
        <div className="flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-rose-500 dark:text-rose-400" />
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Ranking de Deudas a Proveedores</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg transition-colors">
          {deudas.length} proveedores con saldo
        </span>
      </div>

      <div className="flex-1 overflow-auto max-h-[350px] custom-scrollbar">
        {deudas.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 transition-colors">
              <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black">
                <th className="px-6 py-4">RUC / Documento</th>
                <th className="px-6 py-4">Razón Social</th>
                <th className="px-6 py-4 text-right">Monto Adeudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {deudas.map((deuda, idx) => (
                <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-transparent dark:border-slate-700">
                      {deuda.documento}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{deuda.proveedorNombre}</p>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="flex items-center justify-end text-base font-black text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      {formatCurrency(deuda.montoAdeudado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold p-6 text-center transition-colors">
            <Building2 className="w-8 h-8 mb-3 opacity-30" />
            <p>¡Excelentes noticias! No tienes deudas pendientes con ningún proveedor.</p>
          </div>
        )}
      </div>
    </div>
  );
};