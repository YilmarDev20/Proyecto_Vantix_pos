// ==========================
// 1. DASHBOARD
// ==========================
export interface ProductoTop {
  nombre: string;
  sku: string;
  cantidadVendida: number;
  montoTotal: number;
}

export interface DashboardResumen {
  ventasHoy: number;
  ventasAyer: number;
  porcentajeCrecimiento: number;
  ticketsHoy: number;
  topProductos: ProductoTop[];
}

// ==========================
// 2. INVENTARIO PREDICTIVO
// ==========================
export interface InventarioPredictivo {
  sku: string;
  nombreProducto: string;
  stockActual: number;
  ventasUltimos30Dias: number;
  promedioDiarioVentas: number;
  diasRestantesEstimados: number;
  estadoAlerta: 'CRÍTICO (Comprar ya)' | 'PRECAUCIÓN (Planear compra)' | 'SANO' | 'ESTANCADO';
}

// ==========================
// 3. VENTAS Y RENTABILIDAD
// ==========================
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

// ==========================
// 4. FINANZAS Y CAJA
// ==========================
export interface FlujoPago {
  metodoPago: string;
  totalMonto: number;
}

// ==========================
// 5. COMPRAS Y PROVEEDORES
// ==========================
export interface DeudaProveedor {
  proveedorNombre: string;
  documento: string;
  montoAdeudado: number;
}

export interface ReporteCompras {
  totalComprado: number;
  totalDeudaProveedores: number;
  rankingDeudas: DeudaProveedor[];
}