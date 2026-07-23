import type { EstadoPedidoWeb } from "../types/ecommerce-orders.types";

interface Props {
  estado: EstadoPedidoWeb;
}

export const OrderStatusBadge = ({ estado }: Props) => {
  const styles: Record<EstadoPedidoWeb, string> = {
    PENDIENTE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    CONFIRMADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ENTREGADO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CANCELADO: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  const labels: Record<EstadoPedidoWeb, string> = {
    PENDIENTE: "Pendiente Pago",
    CONFIRMADO: "Aprobado", // 👈 Corregido
    ENTREGADO: "Entregado",
    CANCELADO: "Anulado",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[estado] || "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}
    >
      {labels[estado] || estado}
    </span>
  );
};