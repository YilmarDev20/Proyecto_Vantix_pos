export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export type OrigenMovimiento = 
  | 'INVENTARIO_INICIAL' 
  | 'AJUSTE_MANUAL' 
  | 'COMPRA' 
  | 'VENTA' 
  | 'TRASLADO' 
  | 'DEVOLUCION';

export interface KardexResponse {
  id: number;
  varianteId: number;
  varianteSku: string;
  varianteNombre?: string; // <--- LA MAGIA DEL NOMBRE COMPLETO
  
  tiendaId?: number; 
  tiendaNombre?: string; 
  
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockResultante: number;
  origenMovimiento: OrigenMovimiento;
  esAutogenerado: boolean;
  notasInternas: string | null;
  fechaMovimiento: string;
}

export interface AjusteInventario {
  varianteId: number;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  notas?: string;
}

export interface AjusteMasivoRequest {
  tiendaId?: number;
  usuarioId?: number;
  origen: OrigenMovimiento;
  ajustes: AjusteInventario[];
}