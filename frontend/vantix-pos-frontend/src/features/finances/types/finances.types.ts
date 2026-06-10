export type EstadoTurno = 'ABIERTO' | 'CERRADO';
export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';
export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA';

export interface TurnoCajaResponse {
  id: number;
  tiendaId: number;
  usuarioId: number;
  fechaApertura: string;
  fechaCierre: string | null;
  montoApertura: number;
  totalIngresos: number;
  totalEgresos: number;
  montoCierreDeclarado: number | null;
  montoCierreSistema: number | null;
  diferencia: number | null;
  estadoTurno: EstadoTurno;
}

export interface AperturaCajaRequest {
  montoApertura: number;
  tiendaId?: number;
  usuarioId?: number;
}

export interface CierreCajaRequest {
  montoCierreDeclarado: number;
}

export interface NuevoMovimientoRequest {
  tipoMovimiento: TipoMovimientoCaja;
  metodoPago: MetodoPago;
  monto: number;
  concepto: string;
  usuarioId?: number;
}

// NUEVO: Para la tabla de flujo de efectivo
export interface MovimientoCajaResponse {
  id: number;
  tipoMovimiento: TipoMovimientoCaja;
  metodoPago: MetodoPago;
  monto: number;
  concepto: string;
  fechaMovimiento: string;
  usuarioId: number;
}