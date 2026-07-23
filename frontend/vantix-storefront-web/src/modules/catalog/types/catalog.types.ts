export interface CategoriaPublicaDTO {
  id: number;
  nombre: string;
  categoriaPadreId: number | null;
}

export interface DisponibilidadSedeDTO {
  tiendaId: number;
  tiendaNombre: string;
  estadoStock: "DISPONIBLE" | "ULTIMAS_UNIDADES" | "AGOTADO";
}

export interface PresentacionWebDTO {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  factorConversion: number;
  precioVenta: number;
}

export interface VarianteWebDTO {
  id: number;
  sku: string;
  codigoBarras: string | null;
  nombreVariante: string;
  atributos: Record<string, any> | null;
  precioVenta: number;
  precioOferta: number | null;
  precioMayorista: number | null;
  cantidadMayorista: number | null;
  imagenUrl: string | null;
  stockActual: number;
  presentaciones: PresentacionWebDTO[];
  disponibilidadesSedes?: DisponibilidadSedeDTO[]; // 🚀 Agregado aquí
}

export interface PackSurtidoWebDTO {
  id: number;
  nombre: string;
  cantidadRequerida: number;
  precioPack: number;
}

export interface ProductoPadreWebDTO {
  id: number;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  imagenUrl: string | null;
  categoriaId: number | null;
  categoriaNombre: string | null;
  etiquetas: string[] | null;
  precioDesde: number;
  precioHasta: number;
  stockTotalTienda: number;
  variantes: VarianteWebDTO[];
  packsSurtidos: PackSurtidoWebDTO[];
  disponibilidadesSedes?: DisponibilidadSedeDTO[]; // 🚀 Agregado aquí
}