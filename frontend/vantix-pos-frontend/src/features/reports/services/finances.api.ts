import { api } from '@/config/api';
import type { ReporteFinanzas } from '../types/finances.types';

export const FinancesReportService = {
  getResumenFinanciero: async (tiendaId: number | null, inicio: string, fin: string): Promise<ReporteFinanzas> => {
    const params = tiendaId ? { tiendaId, inicio, fin } : { inicio, fin };
    const { data } = await api.get('/reportes/finanzas/resumen', { params });
    return data;
  }
};