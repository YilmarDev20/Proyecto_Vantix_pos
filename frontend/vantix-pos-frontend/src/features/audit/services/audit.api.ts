import { api } from '@/config/api';
import type { AuditoriaLog } from '../types/audit.types';

const AUDIT_URL = '/auditoria';

export const AuditService = {
  // Para la vista "GLOBAL"
  getAll: async (): Promise<AuditoriaLog[]> => {
    const { data } = await api.get(AUDIT_URL);
    return data;
  },

  // Para cuando seleccionas una sucursal específica en el topbar
  getByStore: async (tiendaId: number): Promise<AuditoriaLog[]> => {
    const { data } = await api.get(`${AUDIT_URL}/tienda/${tiendaId}`);
    return data;
  }
};