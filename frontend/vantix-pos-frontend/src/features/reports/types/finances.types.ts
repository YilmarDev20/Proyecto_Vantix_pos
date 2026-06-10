export interface FlujoPago {
  metodoPago: string;
  totalMonto: number;
  cantidadOperaciones: number;
}

export interface MovimientoDetalle {
  fecha: string;
  tipoMovimiento: 'INGRESO' | 'EGRESO';
  metodoPago: string;
  concepto: string;
  monto: number;
}

export interface ReporteFinanzas {
  fondoInicial: number; // NUEVO
  totalIngresos: number;
  totalEgresos: number;
  saldoNeto: number;
  distribucionPagos: FlujoPago[];
  historialMovimientos: MovimientoDetalle[];
}