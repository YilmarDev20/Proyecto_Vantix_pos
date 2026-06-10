export interface Presentacion {
  id?: number; 
  nombre: string;
  codigoBarras: string | null;
  factorConversion: number;
  precioVenta: number;
  estado?: boolean;
}

export interface Variant {
  id: number;
  productoId: number;
  
  // ---> AQUÍ ESTÁN LOS CAMPOS QUE FALTABAN PARA QUITAR EL ERROR <---
  productoNombre?: string; 
  marcaNombre?: string;    
  
  sku: string;
  codigoBarras: string | null;
  atributos: Record<string, any> | null;
  precioCompra: number;
  costoPromedio: number | null;
  precioVenta: number;
  precioMayorista: number | null;
  cantidadMayorista: number | null;
  precioOferta: number | null;
  stockActual: number;
  stockMinimo: number;
  imagenUrl: string | null;
  estado: boolean;
  presentaciones: Presentacion[];
}

// También lo omitimos aquí para no pedirlo al crear
export type VariantRequest = Omit<Variant, 'id' | 'stockActual' | 'costoPromedio' | 'estado' | 'sku' | 'productoNombre' | 'marcaNombre'> & { sku?: string };