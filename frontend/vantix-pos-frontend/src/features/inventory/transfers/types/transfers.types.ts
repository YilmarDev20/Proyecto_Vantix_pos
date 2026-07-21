export type EstadoTraslado = 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'ANULADO';

export interface DetalleTrasladoResponse {
  id: number;
  varianteId: number;
  sku: string;
  nombreProducto: string; 
  marcaProducto?: string;
  atributos: Record<string, any> | null; 
  cantidad: number;
  // 🚀 Persistidos de forma definitiva desde tu backend
  presentacionNombre?: string;
  factorConversion?: number;
}

export interface TrasladoResponse {
  id: number;
  correlativo: string;
  tiendaOrigenId: number;
  tiendaDestinoId: number;
  usuarioCreadorId: number;
  usuarioReceptorId: number | null;
  estadoTraslado: EstadoTraslado;
  notas: string | null;
  fechaCreacion: string;
  fechaRecepcion: string | null;
  detalles: DetalleTrasladoResponse[];
}

export interface DetalleTrasladoRequest {
  varianteId: number;
  cantidad: number;
  // 🚀 Nuevos campos obligatorios en la petición estructurada
  presentacionNombre: string;
  factorConversion: number;
}

export interface TrasladoRequest {
  tiendaOrigenId: number;
  tiendaDestinoId: number;
  usuarioCreadorId: number;
  notas?: string;
  detalles: DetalleTrasladoRequest[];
}