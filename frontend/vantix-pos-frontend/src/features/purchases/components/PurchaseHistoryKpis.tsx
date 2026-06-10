import { ShoppingCart, Calendar } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import type { CompraResponse } from '../types/purchases.types';

interface PurchaseHistoryKpisProps {
  compras: CompraResponse[];
}

export const PurchaseHistoryKpis = ({ compras }: PurchaseHistoryKpisProps) => {
  const totalInvertido = compras.reduce((sum, c) => sum + (c.estadoCompra !== 'ANULADO' ? c.total : 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KpiCard
        title="Facturas Mostradas"
        value={compras.length}
        icon={ShoppingCart}
        colorClass="text-primary bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400"
      />
      <KpiCard
        title="Total Invertido (Filtrado)"
        value={`S/ ${totalInvertido.toFixed(2)}`}
        icon={Calendar}
        colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400"
      />
    </div>
  );
};