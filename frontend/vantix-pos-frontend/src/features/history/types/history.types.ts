export type EstadoVenta = 'COMPLETADA' | 'ANULADA' | 'PENDIENTE_COTIZACION';
export type TipoComprobante = 'TICKET' | 'BOLETA' | 'FACTURA' | 'COTIZACION';

export interface VentaDetalle {
  id: number;
  nombreProductoHistorico: string;
  cantidad: number;
  precioUnitario: number;
  descuentoUnitario: number;
  subtotal: number;
}

export interface PagoVenta {
  id: number;
  metodoPago: string;
  montoPagado: number;
  referencia?: string;
}

export interface Transaction {
  id: number;
  correlativo: string;
  clienteNombre: string | null;
  tipoComprobante: TipoComprobante;
  subtotal: number;
  descuentoTotal: number;
  totalFinal: number;
  estadoVenta: EstadoVenta;
  fechaVenta: string;
  detalles?: VentaDetalle[];
  pagos?: PagoVenta[];
}