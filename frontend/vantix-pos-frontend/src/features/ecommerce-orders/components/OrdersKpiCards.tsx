import { ShoppingBag, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";

interface KpiData {
  totalPedidos: number;
  pendientes: number;
  aprobados: number;
  montoTotalVentas: number;
}

interface Props {
  kpis: KpiData;
}

export const OrdersKpiCards = ({ kpis }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Pedidos"
        value={kpis.totalPedidos}
        icon={ShoppingBag}
        colorClass="text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/30 dark:text-fuchsia-400"
      />
      <KpiCard
        title="Pendientes por Pago"
        value={kpis.pendientes}
        icon={Clock}
        colorClass="text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
      />
      <KpiCard
        title="Aprobados POS"
        value={kpis.aprobados}
        icon={CheckCircle2}
        colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
      />
      <KpiCard
        title="Ventas Aprobadas"
        value={`S/ ${kpis.montoTotalVentas.toFixed(2)}`}
        icon={DollarSign}
        colorClass="text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400"
      />
    </div>
  );
};