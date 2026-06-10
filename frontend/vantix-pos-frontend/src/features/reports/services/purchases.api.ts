import { api } from '@/config/api';
import type { ReporteCompras } from '../types/purchases.types';

export const PurchasesReportService = {
  getResumenCompras: async (tiendaId: number | null, inicio: string, fin: string): Promise<ReporteCompras> => {
    const params = tiendaId ? { tiendaId, inicio, fin } : { inicio, fin };
    const { data } = await api.get('/reportes/compras/resumen', { params });
    return data;
  }
};