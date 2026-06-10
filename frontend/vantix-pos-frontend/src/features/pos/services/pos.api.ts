import { api } from '@/config/api';
import type { NuevaVentaRequest, VentaResponse } from '../types/pos.types';

const SALES_URL = '/sales/transactions';

export const PosService = {
  procesarVenta: async (request: NuevaVentaRequest): Promise<VentaResponse> => {
    const { data } = await api.post(SALES_URL, request);
    return data;
  },

  getHistorialVentas: async (): Promise<VentaResponse[]> => {
    const { data } = await api.get(SALES_URL);
    return data;
  }
};