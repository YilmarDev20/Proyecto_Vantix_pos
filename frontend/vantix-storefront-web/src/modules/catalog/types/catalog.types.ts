export interface PresentacionPublicaDTO {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  factorConversion: number;
  precioVenta: number;
}

export interface CatalogoWebResponseDTO {
  id: number;
  productoId: number;
  productoNombre: string;
  marcaNombre: string | null;
  sku: string;
  codigoBarras: string | null;
  atributos: Record<string, any>;
  precioVenta: number;
  precioMayorista: number | null;
  cantidadMayorista: number | null;
  precioOferta: number | null;
  stockActual: number;
  imagenUrl: string | null;
  presentaciones: PresentacionPublicaDTO[];
}