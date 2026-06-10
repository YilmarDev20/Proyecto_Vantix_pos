export interface Category {
  id: number;
  categoriaPadreId: number | null;
  nombre: string;
  codigoPrefijo: string;
  imagenUrl: string | null;
  estado: boolean;
}

// Lo que enviamos al backend para crear/editar
export type CategoryRequest = Omit<Category, 'id' | 'estado'>;