import { AlertTriangle, PackageX, Truck, FileWarning, Wallet, CheckCircle2 } from 'lucide-react';
import type { DashboardResumen } from '../types/dashboard.types';

interface Props {
  data: DashboardResumen;
}

export const DashboardAlerts = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;
  const totalAlertas = data.alertasStock.length + data.alertasTraslados.length + data.alertasDeudas.length + data.alertasCaja.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-200">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
          Acción Requerida
        </h3>
        {totalAlertas > 0 && (
          <span className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 text-xs font-black px-2.5 py-1 rounded-full">
            {totalAlertas} pendientes
          </span>
        )}
      </div>

      <div className="p-4 flex-1 overflow-auto max-h-[400px]">
        {totalAlertas === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 opacity-50" />
            <p className="text-slate-500 dark:text-slate-400">¡Todo en orden!</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">No tienes alertas pendientes de stock, traslados ni deudas urgentes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* ALERTAS DE CAJA (Rose traslúcido nocturno) */}
            {data.alertasCaja.map((caja, idx) => (
              <div key={`caja-${idx}`} className="flex items-start p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                <Wallet className="w-5 h-5 text-rose-500 dark:text-rose-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-900 dark:text-rose-200">{caja.mensaje}</p>
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mt-1">Turno ID: {caja.turnoId}</p>
                </div>
              </div>
            ))}

            {/* ALERTAS DE TRASLADOS PENDIENTES (Blue traslúcido nocturno) */}
            {data.alertasTraslados.map((traslado, idx) => (
              <div key={`traslado-${idx}`} className="flex items-start p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                <Truck className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Traslado Pendiente de Recepción</p>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mt-1">Correlativo: <strong className="dark:text-white">{traslado.correlativo}</strong></p>
                </div>
              </div>
            ))}

            {/* ALERTAS DE DEUDAS URGENTES (Orange traslúcido nocturno) */}
            {data.alertasDeudas.map((deuda, idx) => (
              <div key={`deuda-${idx}`} className="flex items-start p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                <FileWarning className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-0.5 mr-3 shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-200 flex justify-between">
                    <span>Deuda a: {deuda.proveedor}</span>
                    <span className="font-black text-orange-700 dark:text-orange-400">{formatCurrency(deuda.montoAdeudado)}</span>
                  </p>
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mt-1">Factura: {deuda.comprobante}</p>
                </div>
              </div>
            ))}

            {/* ALERTAS DE STOCK CRÍTICO (Slate elevado nocturno) */}
            {data.alertasStock.map((stock, idx) => (
              <div key={`stock-${idx}`} className="flex items-start p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl">
                <PackageX className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5 mr-3 shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={stock.producto}>{stock.producto}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">SKU: {stock.sku}</span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                      Quedan {stock.stockActual} und.
                    </span>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};