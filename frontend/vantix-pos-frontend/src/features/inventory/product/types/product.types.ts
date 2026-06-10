export type UnidadMedida = 'NIU' | 'KGM' | 'LTR' | 'MTR' | 'BX';

// ---> NUEVO: Interface para el Pack Surtido
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
  // ---> NUEVO: Arreglo de packs que viene del backend
  packsSurtidos?: PackSurtido[]; 
}

export type ProductRequest = Omit<Product, 'id' | 'estado' | 'fechaCreacion'>;