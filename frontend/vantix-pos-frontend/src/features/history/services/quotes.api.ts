import { api } from '@/config/api';

export interface ItemValidado {
  varianteId: number;
  productoId: number; // NUEVO: Para que la canasta encuentre el nombre
  sku: string;
  nombreProducto: string;
  atributos: Record<string, any>; // NUEVO: Para color, talla, etc.
  cantidadSolicitada: number;
  stockActual: number;
  precioCotizado: number;
  hayStockSuficiente: boolean;
}

export interface ValidacionCotizacion {
  todoDisponible: boolean;
  clienteId: number;
  clienteNombre: string;
  telefonoCliente?: string;
  items: ItemValidado[];
}

export const QuotesService = {
  // GET: Validar stock antes de cobrar o editar
  validarParaCobro: async (id: number, tiendaId: number): Promise<ValidacionCotizacion> => {
    const { data } = await api.get(`/sales/quotes/${id}/validate?tiendaId=${tiendaId}`);
    return data;
  },

  // PUT: Enviar los cambios de la cotización al backend
  actualizarCotizacion: async (id: number, payload: any): Promise<any> => {
    const { data } = await api.put(`/sales/quotes/${id}`, payload);
    return data;
  }
};