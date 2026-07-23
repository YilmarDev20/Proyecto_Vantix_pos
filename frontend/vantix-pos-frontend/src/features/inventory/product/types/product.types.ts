export type UnidadMedida = 'NIU' | 'KGM' | 'LTR' | 'MTR' | 'BX';

// Interface para el Pack Surtido
export interface PackSurtido {
  id?: number;
  nombre: string;
  cantidadRequerida: number;
  precioPack: number;
}

export interface Product {
  id: number;
  categoriaId: number | null;
  nombre: string;
  descripcion: string | null;
  etiquetas: string[] | null;
  unidadMedida: UnidadMedida;
  imagenUrl: string | null;
  marca: string | null;
  estado: boolean;
  fechaCreacion: string;
  
  // 🚀 NUEVO: Interruptor maestro para el e-commerce
  publicadoEnWeb: boolean;
  
  packsSurtidos?: PackSurtido[]; 
}

export type ProductRequest = Omit<Product, 'id' | 'estado' | 'fechaCreacion'>;