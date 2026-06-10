export type TipoComprobante = 'TICKET' | 'BOLETA' | 'FACTURA' | 'COTIZACION';
export type EstadoVenta = 'COMPLETADA' | 'ANULADA' | 'PENDIENTE_COTIZACION';
export type MetodoPagoVenta = 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'CREDITO';

// ---> AQUÍ ESTÁ EL TIPO QUE FALTABA <---
export type EstadoPagoVenta = 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

export interface DetalleVentaReq {
  varianteId: number;
  presentacionId?: number | null; 
  cantidad: number;
  precioUnitario: number;
  descuentoUnitario?: number;
  subtotal: number;
}

export interface PagoVentaReq {
  metodoPago: MetodoPagoVenta;
  montoPagado: number;
  referencia?: string;
}

export interface NuevaVentaRequest {
  tiendaId?: number;
  usuarioId?: number;
  clienteId?: number;
  turnoCajaId?: number;
  cotizacionOrigenId?: number | null; 
  tipoComprobante: TipoComprobante;
  subtotal: number;
  descuentoTotal?: number;
  impuestoTotal?: number;
  totalFinal: number;
  pagoRecibido: number;
  vuelto?: number;
  observaciones?: string;
  detalles: DetalleVentaReq[];
  pagos: PagoVentaReq[];
}

export interface VentaResponse {
  id: number;
  correlativo: string;
  clienteNombre: string;
  tipoComprobante: TipoComprobante;
  subtotal: number;
  descuentoTotal: number;
  totalFinal: number;
  estadoVenta: EstadoVenta;
  
  // NUEVOS CAMPOS FINANCIEROS
  estadoPago: EstadoPagoVenta;
  saldoPendiente: number;
  
  fechaVenta: string;
  detalles: any[]; // Lo dejamos como any[] por ahora para resumir, o pon tus interfaces
  pagos: any[];
}