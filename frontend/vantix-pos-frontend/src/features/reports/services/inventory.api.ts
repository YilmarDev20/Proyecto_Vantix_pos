import { api } from '@/config/api';
import type { InventarioPredictivo } from '../types/inventory.types';

export const InventoryReportService = {
  getInventarioPredictivo: async (tiendaId: number | null, diasAnalisis: number = 30): Promise<InventarioPredictivo[]> => {
    const params = tiendaId ? { tiendaId, diasAnalisis } : { diasAnalisis };
    const { data } = await api.get('/reportes/inventario/predictivo', { params });
    return data;
  }
};