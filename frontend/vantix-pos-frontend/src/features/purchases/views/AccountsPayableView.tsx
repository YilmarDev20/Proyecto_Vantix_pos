import { useEffect, useState } from 'react';
import { CreditCard, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { PurchasesService } from '../services/purchases.api';
import type { CompraResponse } from '../types/purchases.types';

import { KpiCard } from '@/components/ui/KpiCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { useStore } from '@/core/store/context/StoreContext';

export const AccountsPayableView = () => {
  const { activeStoreId } = useStore();

  const [deudas, setDeudas] = useState<CompraResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isConfirmPayOpen, setIsConfirmPayOpen] = useState(false);
  const [deudaToPay, setDeudaToPay] = useState<CompraResponse | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const tiendaIdQuery = activeStoreId || 1;
      const data = await PurchasesService.getCuentasPorPagar(tiendaIdQuery);
      setDeudas(data);
    } catch (error) {
      toast.error('Error al cargar las cuentas por pagar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStoreId]);

  const totalDeuda = deudas.reduce((sum, d) => sum + d.saldoPendiente, 0);

  const handleOpenPayConfirm = (compra: CompraResponse) => {
    setDeudaToPay(compra);
    setIsConfirmPayOpen(true);
  };

  const confirmPayment = async () => {
    if (!deudaToPay) return;
    try {
      await PurchasesService.pagarDeuda(deudaToPay.id);
      toast.success('Deuda liquidada correctamente.');
      setIsConfirmPayOpen(false); 
      loadData();
    } catch (error: any) {
      console.error("Detalle del error:", error); 
      toast.error('Error al registrar el pago. Asegúrate de haber reiniciado el Backend.');
      setIsConfirmPayOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Deuda Total a Proveedores"
          value={`S/ ${totalDeuda.toFixed(2)}`}
          icon={Wallet}
          colorClass="text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400"
        />
        <KpiCard
          title="Facturas Pendientes"
          value={deudas.length}
          icon={AlertTriangle}
          colorClass="text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cuentas por Pagar</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Administra las facturas ingresadas con método de pago "Al Crédito".</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha de Compra</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Proveedor</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">N° Comprobante</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Total Factura</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Saldo Deudor</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando cuentas pendientes...</td></tr>
              ) : deudas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center bg-white dark:bg-slate-900 transition-colors">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-300 font-bold">¡Todo al día!</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No tienes ninguna deuda pendiente con proveedores.</p>
                  </td>
                </tr>
              ) : (
                deudas.map((deuda) => (
                  <tr key={deuda.id} className="hover:bg-orange-50/30 dark:hover:bg-orange-950/10 transition-colors">
                    <td className="py-3 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {format(new Date(deuda.fechaCompra), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="py-3 px-6 text-sm font-bold text-slate-800 dark:text-slate-200">{deuda.proveedorRazonSocial}</td>
                    <td className="py-3 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{deuda.numeroComprobante}</td>
                    <td className="py-3 px-6 text-right font-medium text-slate-600 dark:text-slate-400">S/ {deuda.total.toFixed(2)}</td>
                    <td className="py-3 px-6 text-right font-black text-orange-600 dark:text-orange-400">
                      S/ {deuda.saldoPendiente.toFixed(2)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button 
                        type="button"
                        onClick={() => handleOpenPayConfirm(deuda)}
                        className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white rounded-lg transition-colors inline-flex items-center font-bold text-sm border border-transparent dark:border-emerald-800/30"
                        title="Registrar Pago"
                      >
                        <CreditCard className="w-4 h-4 mr-1.5" /> Liquidar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmPayOpen}
        onClose={() => setIsConfirmPayOpen(false)}
        onConfirm={confirmPayment}
        title="Liquidar Deuda"
        message={`¿Confirmas el pago de S/ ${deudaToPay?.saldoPendiente?.toFixed(2)} al proveedor ${deudaToPay?.proveedorRazonSocial} por la factura ${deudaToPay?.numeroComprobante}?`}
        confirmText="Sí, Liquidar Deuda"
        cancelText="Cancelar"
        isDestructive={false}
      />
    </div>
  );
};