import { useEffect, useState, useMemo } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { EcommerceOrdersService } from "../services/ecommerce-orders.api";
import type { PedidoWebResponseDTO } from "../types/ecommerce-orders.types";
import { OrdersTable } from "../components/OrdersTable";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { OrdersKpiCards } from "../components/OrdersKpiCards";
import { OrdersFilters } from "../components/OrdersFilters";
import { useStore } from "@/core/store/context/StoreContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export const EcommerceOrdersView = () => {
  const [orders, setOrders] = useState<PedidoWebResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PedidoWebResponseDTO | null>(null);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [methodFilter, setMethodFilter] = useState<string>("TODOS");

  // Estado del Modal de Anulación
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  const { activeStoreId, activeStoreName } = useStore();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await EcommerceOrdersService.obtenerPedidos();

      if (activeStoreId !== null) {
        const filtrados = data.filter((o) => o.tiendaId === activeStoreId);
        setOrders(filtrados);
      } else {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error cargando pedidos web:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStoreId]);

  // Cálculo de KPIs
  const kpis = useMemo(() => {
    const totalPedidos = orders.length;
    const pendientes = orders.filter((o) => o.estado === "PENDIENTE").length;
    const aprobados = orders.filter((o) => o.estado === "CONFIRMADO" || o.estado === "ENTREGADO").length;
    const montoTotalVentas = orders
      .filter((o) => o.estado === "CONFIRMADO" || o.estado === "ENTREGADO")
      .reduce((acc, o) => acc + (o.montoTotal || 0), 0);

    return { totalPedidos, pendientes, aprobados, montoTotalVentas };
  }, [orders]);

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.codigoPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clienteTelefono.includes(searchTerm);

      const matchStatus = statusFilter === "TODOS" || o.estado === statusFilter;
      const matchMethod = methodFilter === "TODOS" || o.metodoPago === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [orders, searchTerm, statusFilter, methodFilter]);

  const handleApprove = async (id: number) => {
    try {
      await EcommerceOrdersService.aprobarPedido(id);
      fetchOrders();
    } catch (error) {
      console.error("Error al aprobar pedido:", error);
      alert("No se pudo aprobar el pedido.");
    }
  };

  const handleOpenCancelDialog = (id: number) => {
    setOrderToCancel(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      await EcommerceOrdersService.cancelarPedido(orderToCancel, "Cancelado desde el POS por el administrador");
      fetchOrders();
    } catch (error) {
      console.error("Error al anular pedido:", error);
      alert("No se pudo anular el pedido.");
    } finally {
      setOrderToCancel(null);
    }
  };

  return (
    <div className="p-2 sm:p-4 space-y-6">
      {/* HEADER DE LA VISTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                Pedidos Web Entrantes
              </h1>
              <span className="bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-fuchsia-200 dark:border-fuchsia-800">
                {activeStoreName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestiona, verifica los vouchers de Yape/Plin y aprueba las ventas entrantes de la tienda web.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* COMPONENTE KPIS */}
      <OrdersKpiCards kpis={kpis} />

      {/* COMPONENTE FILTROS */}
      <OrdersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
      />

      {/* TABLA PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <OrdersTable
          orders={filteredOrders}
          loading={loading}
          onViewDetail={(order) => setSelectedOrder(order)}
          onApprove={handleApprove}
          onCancel={handleOpenCancelDialog}
          activeStoreId={activeStoreId}
        />
      </div>

      {/* MODAL DETALLE */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onApprove={handleApprove}
        onCancel={handleOpenCancelDialog}
      />

      {/* CONFIRM DIALOG ANULACIÓN */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title="¿Anular Pedido Web?"
        message="Esta acción cancelará la solicitud del cliente. Esta operación es irreversible."
        confirmText="Sí, Anular Pedido"
        cancelText="Volver"
        isDestructive={true}
      />
    </div>
  );
};