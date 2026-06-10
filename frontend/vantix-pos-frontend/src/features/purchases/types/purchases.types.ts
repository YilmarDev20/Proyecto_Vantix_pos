export type EstadoCompra = 'PAGADO' | 'POR_PAGAR' | 'ANULADO';
export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO';

// --- PROVEEDORES ---
export interface ProveedorResponse {
  id: number;
  documento: string;
  razonSocial: string;
  nombreContacto: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: boolean;
}

export interface ProveedorRequest {
  documento: string;
  razonSocial: string;
  nombreContacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

// --- COMPRAS ---
export interface DetalleCompraDTO {
  varianteId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface NuevaCompraRequest {
  proveedorId: number;
  numeroComprobante: string;
  metodoPago: MetodoPago;
  total: number;
  tiendaId?: number;
  usuarioId?: number;
  detalles: DetalleCompraDTO[];
}

export interface CompraResponse {
  id: number;
  proveedorRazonSocial: string;
  numeroComprobante: string;
  fechaCompra: string;
  metodoPago: MetodoPago;
  estadoCompra: EstadoCompra;
  total: number;
  saldoPendiente: number;
  // CORRECCIÓN: Agregamos la lista de detalles que nos devuelve el Backend
  detalles: DetalleCompraDTO[]; 
}