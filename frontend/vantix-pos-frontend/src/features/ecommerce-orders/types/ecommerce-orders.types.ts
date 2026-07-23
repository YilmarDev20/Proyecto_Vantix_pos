export type EstadoPedidoWeb = "PENDIENTE" | "CONFIRMADO" | "ENTREGADO" | "CANCELADO";

export interface ItemPedidoResponseDTO {
  id: number;
  varianteId: number;
  presentacionId?: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoWebResponseDTO {
  id: number;
  codigoPedido: string; // Ej: ZAR-1001
  clienteNombre: string;
  clienteTelefono: string;
  tiendaId: number;
  tipoEntrega: string; // "RECOJO_TIENDA"
  metodoPago: string; // "YAPE", "PLIN", "EFECTIVO"
  comprobanteUrl?: string; // Ruta de la captura del Yape
  montoTotal: number;
  estado: EstadoPedidoWeb;
  fechaCreacion: string;
  detalles: ItemPedidoResponseDTO[];
}

export interface PedidoWebFiltros {
  tiendaId?: number;
  estado?: EstadoPedidoWeb;
  busqueda?: string;
}