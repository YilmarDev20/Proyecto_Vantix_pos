export interface InventarioPredictivo {
  varianteId: number;
  sku: string;
  nombreFormateado: string;
  costo: number;
  precio: number;
  margenGanancia: number;
  stockActual: number;
  stockMinimo: number;
  isBajoStockMinimo: boolean;
  ventasUltimosDias: number;
  promedioDiarioVentas: number;
  diasRestantesEstimados: number;
  estadoAlerta: string;
}