import { api } from '@/config/api';
import type { ReporteVentas } from '../types/sales.types';

export const SalesReportService = {
  getReporteVentas: async (tiendaId: number | null, inicio: string, fin: string): Promise<ReporteVentas> => {
    const params = tiendaId ? { tiendaId, inicio, fin } : { inicio, fin };
    const { data } = await api.get('/reportes/ventas', { params });
    return data;
  }
};