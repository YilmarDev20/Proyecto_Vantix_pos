export interface VendedorRanking {
  nombreVendedor: string;
  totalVendido: number;
  cantidadOperaciones: number;
}

export interface ClienteValor {
  id: number;
  documento: string;
  nombre: string;
  monto: number;
}

export interface ReporteVentas {
  ventasTotales: number;
  costoTotalInventario: number;
  utilidadNeta: number;
  rankingVendedores: VendedorRanking[];
  rankingClientes: ClienteValor[];
  listaDeudores: ClienteValor[];
}