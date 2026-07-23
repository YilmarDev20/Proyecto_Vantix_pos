import { api } from '@/config/api';
import type { 
  PedidoWebResponseDTO, 
  PedidoWebFiltros 
} from '../types/ecommerce-orders.types';

const BASE_URL = '/admin/pedidos-web';

export const EcommerceOrdersService = {
  /**
   * Obtiene la lista de pedidos web con filtros opcionales por tienda o estado.
   */
  obtenerPedidos: async (filtros?: PedidoWebFiltros): Promise<PedidoWebResponseDTO[]> => {
    const params = new URLSearchParams();
    if (filtros?.tiendaId) params.append('tiendaId', filtros.tiendaId.toString());
    if (filtros?.estado) params.append('estado', filtros.estado);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`${BASE_URL}${queryString}`);
    return data;
  },

  /**
   * Obtiene la información detallada de un pedido por su ID.
   */
  obtenerPorId: async (id: number): Promise<PedidoWebResponseDTO> => {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  },

  /**
   * Aprueba el pedido web, lo convierte en venta en la caja del POS y descuenta stock.
   */
  aprobarPedido: async (id: number): Promise<PedidoWebResponseDTO> => {
    const { data } = await api.put(`${BASE_URL}/${id}/aprobar`);
    return data;
  },

  /**
   * Rechaza/cancela el pedido web y libera el stock reservado.
   */
  cancelarPedido: async (id: number, motivo?: string): Promise<PedidoWebResponseDTO> => {
    const { data } = await api.put(`${BASE_URL}/${id}/cancelar`, { motivo });
    return data;
  }
};