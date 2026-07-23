export interface Presentacion {
  id?: number; 
  nombre: string;
  codigoBarras: string | null;
  factorConversion: number;
  precioVenta: number;
  estado?: boolean;
  publicadoEnWeb?: boolean; // 👈 ¡FALTA ESTA LÍNEA AQUÍ!
}

export interface Variant {
  id: number;
  productoId: number;
  
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

  // 🚀 NUEVO: Interruptor individual para la variante en el e-commerce
  publicadoEnWeb: boolean;

  presentaciones: Presentacion[];
}

export type VariantRequest = Omit<Variant, 'id' | 'stockActual' | 'costoPromedio' | 'estado' | 'sku' | 'productoNombre' | 'marcaNombre'> & { sku?: string };