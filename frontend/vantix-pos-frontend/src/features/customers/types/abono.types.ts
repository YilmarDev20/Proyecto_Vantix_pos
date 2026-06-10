export type MetodoPagoVenta = 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'CREDITO';

export interface AbonoRequest {
  clienteId: number;
  turnoCajaId: number;
  montoTotal: number;
  metodoPago: MetodoPagoVenta;
  referencia?: string;
  notas?: string;
}

export interface DetalleAbonoRes {
  id: number;
  ventaId: number;
  correlativoVenta: string;
  montoAsignado: number;
}

export interface AbonoResponse {
  id: number;
  clienteId: number;
  clienteNombre: string;
  turnoCajaId: number;
  montoTotal: number;
  metodoPago: MetodoPagoVenta;
  referencia: string | null;
  notas: string | null;
  estado: boolean;
  fechaAbono: string;
  detalles: DetalleAbonoRes[];
}