import { api } from '@/config/api';
import type { KardexResponse, AjusteMasivoRequest } from '../types/kardex.types';

const KARDEX_URL = '/kardex';

export const KardexService = {
  // ---> CAMBIO: Recibe el tiendaId para filtrar el historial <---
  getHistorialCompleto: async (tiendaId: number): Promise<KardexResponse[]> => {
    // Asumiendo que tu backend lo recibe por parámetro o path
    const { data } = await api.get(`${KARDEX_URL}?tiendaId=${tiendaId}`);
    return data;
  },

  getHistorialPorVariante: async (varianteId: number): Promise<KardexResponse[]> => {
    const { data } = await api.get(`${KARDEX_URL}/variante/${varianteId}`);
    return data;
  },

  procesarAjusteMasivo: async (request: AjusteMasivoRequest): Promise<void> => {
    await api.post(`${KARDEX_URL}/ajuste-masivo`, request);
  }
};