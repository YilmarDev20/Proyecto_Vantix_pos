import { api } from '@/config/api';
import type { Transaction } from '../types/history.types';
import type { VentaResponse } from '@/features/pos/types/pos.types';

const BASE_URL = '/sales/transactions'; 

export const HistoryService = {
  obtenerHistorial: async (tiendaId: number | null): Promise<Transaction[]> => {
    // Si tiendaId es null, la URL será solo '/sales/transactions'
    const url = tiendaId !== null ? `${BASE_URL}?tiendaId=${tiendaId}` : BASE_URL;
    const { data } = await api.get(url);
    return data;
  },

  obtenerDetalle: async (id: number): Promise<Transaction> => {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  },

  anularVenta: async (id: number): Promise<void> => {
    await api.post(`${BASE_URL}/${id}/anular`);
  },

  getVentasPorCliente: async (clienteId: number): Promise<VentaResponse[]> => {
    const { data } = await api.get(`${BASE_URL}/cliente/${clienteId}`); 
    return data;
  }
};