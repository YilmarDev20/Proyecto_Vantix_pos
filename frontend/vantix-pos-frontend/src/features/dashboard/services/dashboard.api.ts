import { api } from '@/config/api';
import type { DashboardResumen } from '../types/dashboard.types';

export const DashboardService = {
  // AÑADIMOS EL PARÁMETRO "rango" CON VALOR POR DEFECTO 'HOY'
  getResumenHoy: async (tiendaId: number | null, rango: 'HOY' | 'MES' = 'HOY'): Promise<DashboardResumen> => {
    const params = tiendaId ? { tiendaId, rango } : { rango };
    const { data } = await api.get('/dashboard', { params });
    return data;
  }
};