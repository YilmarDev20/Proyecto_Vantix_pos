import { X, ExternalLink, ShoppingBag, CheckCircle, XCircle } from "lucide-react";
import type { PedidoWebResponseDTO } from "../types/ecommerce-orders.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: PedidoWebResponseDTO | null;
  onApprove: (id: number) => void;
  onCancel: (id: number) => void;
}

// 🚀 Mapa auxiliar para traducir tiendaId a su nombre real
const NOMBRES_TIENDAS: Record<number, string> = {
  1: "Independencias",
  2: "Dos Palmas",
};

export const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onApprove,
  onCancel,
}: Props) => {
  if (!isOpen || !order) return null;

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.DEV
      ? "http://localhost:8080"
      : "http://159.89.54.99";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const fullImageUrl = getFullUrl(order.comprobanteUrl);

  // 🚀 Mapeo dinámico de la sede elegida usando tiendaId
  const nombreSedeElegida = order.tiendaId
    ? NOMBRES_TIENDAS[order.tiendaId] || `Sede #${order.tiendaId}`
    : "Sin Sede";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
            <h3 className="text-base font-black text-slate-800 dark:text-white">
              Detalle del Pedido #{order.codigoPedido}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* INFORMACIÓN DEL CLIENTE Y SEDE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block font-bold mb-0.5">Cliente:</span>
              <span className="font-extrabold text-slate-800 dark:text-white text-sm">{order.clienteNombre}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold mb-0.5">Teléfono:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{order.clienteTelefono}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold mb-0.5">Sede Elegida:</span>
              {/* 🚀 MUESTRA EL NOMBRE REAL SEGÚN EL tiendaId */}
              <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{nombreSedeElegida}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold mb-0.5">Método de Pago:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">{order.metodoPago}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TABLA DE PRODUCTOS COMPRADOS */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Productos Solicitados
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-center">Cant.</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {order.detalles && order.detalles.length > 0 ? (
                      order.detalles.map((d: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {d.productoNombre}
                          </td>
                          <td className="p-2.5 text-center font-black">{d.cantidad}</td>
                          <td className="p-2.5 text-right font-extrabold text-slate-900 dark:text-white">
                            S/ {(d.precioUnitario * d.cantidad).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                          Consulte la orden en sistema POS
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl font-black text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">
                <span>Total a Cobrar:</span>
                <span className="text-base text-fuchsia-600 dark:text-fuchsia-400">
                  S/ {order.montoTotal ? order.montoTotal.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            {/* VOUCHER YAPE / PLIN */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Comprobante Adjunto
              </h4>
              <div className="bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center min-h-[220px]">
                {fullImageUrl ? (
                  <img
                    src={fullImageUrl}
                    alt={`Voucher ${order.codigoPedido}`}
                    className="max-h-[200px] object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <span className="text-slate-400 italic">Sin comprobante adjunto</span>
                )}
              </div>
              {fullImageUrl && (
                <div className="text-right">
                  <a
                    href={fullImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-fuchsia-600 dark:text-fuchsia-400 hover:underline font-bold"
                  >
                    <span>Ver imagen completa</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {order.estado === "PENDIENTE" && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onCancel(order.id);
                  onClose();
                }}
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900 dark:text-rose-300 font-bold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Anular Pedido</span>
              </button>
              <button
                onClick={() => {
                  onApprove(order.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprobar Venta POS</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};