export interface DeudaProveedor {
  proveedorNombre: string;
  documento: string;
  montoAdeudado: number;
}

export interface InversionCategoria {
  categoria: string;
  total: number;
}

export interface InversionTienda {
  tiendaId: number;
  total: number;
}

export interface HistorialCompra {
  fecha: string;
  comprobante: string;
  proveedor: string;
  metodoPago: string;
  estado: string;
  total: number;
}

export interface ReporteCompras {
  totalComprado: number;
  totalDeudaProveedores: number;
  rankingDeudas: DeudaProveedor[];
  inversionPorCategoria: InversionCategoria[];
  inversionPorTienda: InversionTienda[];
  historialCompras: HistorialCompra[]; // NUEVO
}