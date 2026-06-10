export interface ProductoTop {
  nombre: string;
  sku: string;
  cantidadVendida: number;
  montoTotal: number;
}

export interface ClienteVip {
  nombre: string;
  totalComprado: number;
}

export interface AlertaStock {
  producto: string;
  sku: string;
  stockActual: number;
  stockMinimo: number;
}

export interface AlertaTraslado {
  correlativo: string;
  tiendaOrigenId: number;
  fechaEnvio: string;
}

export interface AlertaDeuda {
  proveedor: string;
  comprobante: string;
  montoAdeudado: number;
  fechaEmision: string;
}

export interface AlertaCaja {
  turnoId: number;
  fechaApertura: string;
  mensaje: string;
}

export interface VentasPorHora {
  hora: number;
  total: number;
}

export interface DashboardResumen {
  ventasHoy: number;
  ventasAyer: number;
  porcentajeCrecimiento: number;
  ticketsHoy: number;
  ticketPromedio: number;
  cajaFisicaActual: number;
  mensajeDelDia: string;
  
  // Arreglos de datos
  alertasStock: AlertaStock[];
  alertasTraslados: AlertaTraslado[];
  alertasDeudas: AlertaDeuda[];
  alertasCaja: AlertaCaja[];
  topProductos: ProductoTop[];
  topClientes: ClienteVip[];
  ventasPorHora: VentasPorHora[];
}