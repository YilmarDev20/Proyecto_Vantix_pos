import { Eye, CheckCircle, XCircle, ArrowRightLeft, MessageCircle } from "lucide-react";
import type { PedidoWebResponseDTO } from "../types/ecommerce-orders.types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface Props {
  orders: PedidoWebResponseDTO[];
  loading: boolean;
  onViewDetail: (order: PedidoWebResponseDTO) => void;
  onApprove: (id: number) => void;
  onCancel: (id: number) => void;
  activeStoreId: number | null;
}

const NOMBRES_TIENDAS: Record<number, string> = {
  1: "Independencias",
  2: "Dos Palmas",
};

export const OrdersTable = ({
  orders,
  loading,
  onViewDetail,
  onApprove,
  onCancel,
  activeStoreId,
}: Props) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse">
        Cargando pedidos web entrantes...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        No hay pedidos web registrados en esta sección.
      </div>
    );
  }

  // 🚀 Generador de enlace directo a WhatsApp
  const getWhatsAppLink = (phone: string, codigo: string, cliente: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
    const text = encodeURIComponent(
      `¡Hola ${cliente}! 👋 Te saludamos de Zarely. Te escribimos sobre tu pedido web #${codigo}.`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/80 uppercase tracking-wider">
            <th className="p-3.5">Código</th>
            <th className="p-3.5">Cliente</th>
            <th className="p-3.5">Teléfono / WhatsApp</th>
            <th className="p-3.5">Sede Recojo</th>
            <th className="p-3.5">Método Pago</th>
            <th className="p-3.5">Voucher / Productos</th>
            <th className="p-3.5">Total</th>
            <th className="p-3.5">Estado</th>
            <th className="p-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
          {orders.map((o) => {
            const nombreTienda = o.tiendaId ? (NOMBRES_TIENDAS[o.tiendaId] || `Sede #${o.tiendaId}`) : "Sin Sede";
            const requiereTraslado = activeStoreId !== null && o.tiendaId !== null && o.tiendaId !== activeStoreId;

            return (
              <tr
                key={o.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="p-3.5 font-black text-slate-900 dark:text-white">
                  {o.codigoPedido}
                </td>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                  {o.clienteNombre}
                </td>
                {/* 🚀 CELDA CON ACCIÓN DE WHATSAPP DIRECTA */}
                <td className="p-3.5">
                  <a
                    href={getWhatsAppLink(o.clienteTelefono, o.codigoPedido, o.clienteNombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold hover:underline"
                    title="Abrir chat de WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20" />
                    <span>{o.clienteTelefono}</span>
                  </a>
                </td>
                <td className="p-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {nombreTienda}
                    </span>
                    {requiereTraslado && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        <span>Traslado Req.</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase">
                    {o.metodoPago}
                  </span>
                </td>
                <td className="p-3.5">
                  <button
                    onClick={() => onViewDetail(o)}
                    className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-bold active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 text-fuchsia-500" />
                    <span>Ver Detalle</span>
                  </button>
                </td>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white text-sm">
                  S/ {o.montoTotal ? o.montoTotal.toFixed(2) : "0.00"}
                </td>
                <td className="p-3.5">
                  <OrderStatusBadge estado={o.estado as any} />
                </td>
                <td className="p-3.5 text-right">
                  {o.estado === "PENDIENTE" && (
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onApprove(o.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer active:scale-95 shadow-xs"
                        title="Aprobar y Emitir Ticket POS"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => onCancel(o.id)}
                        className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:text-slate-400 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Anular Pedido"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Anular</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};