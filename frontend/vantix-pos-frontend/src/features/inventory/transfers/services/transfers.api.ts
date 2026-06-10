import { api } from '@/config/api';
import type { TrasladoRequest, TrasladoResponse } from '../types/transfers.types';

const BASE_URL = '/transfers';

export const TransfersService = {
  crearTraslado: async (request: TrasladoRequest): Promise<TrasladoResponse> => {
    const { data } = await api.post(BASE_URL, request);
    return data;
  },

  aceptarTraslado: async (id: number, usuarioId: number): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/accept?usuarioId=${usuarioId}`);
  },

  rechazarTraslado: async (id: number, usuarioId: number): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/reject?usuarioId=${usuarioId}`);
  },

  obtenerHistorial: async (tiendaId: number): Promise<TrasladoResponse[]> => {
    const { data } = await api.get(`${BASE_URL}?tiendaId=${tiendaId}`);
    return data;
  }
};