import { api } from '@/config/api';
import type { 
  DashboardResumen, 
  InventarioPredictivo, 
  ReporteVentas, 
  FlujoPago, 
  ReporteCompras 
} from '../types/reports.types';

const BASE_URL = '/reportes';

export const ReportsService = {
  
  // 1. Dashboard (No pide fechas, el backend calcula "Hoy vs Ayer")
  getDashboard: async (tiendaId: number | null): Promise<DashboardResumen> => {
    const params = tiendaId ? { tiendaId } : {};
    const { data } = await api.get(`${BASE_URL}/dashboard`, { params });
    return data;
  },

  // 2. Inventario Predictivo y Estancado
  getInventarioPredictivo: async (tiendaId: number | null, diasAnalisis: number = 30): Promise<InventarioPredictivo[]> => {
    const params = tiendaId ? { tiendaId, diasAnalisis } : { diasAnalisis };
    const { data } = await api.get(`${BASE_URL}/inventario/predictivo`, { params });
    return data;
  },

  getInventarioEstancado: async (tiendaId: number | null, diasAnalisis: number = 30): Promise<InventarioPredictivo[]> => {
    const params = tiendaId ? { tiendaId, diasAnalisis } : { diasAnalisis };
    const { data } = await api.get(`${BASE_URL}/inventario/estancado`, { params });
    return data;
  },

  // 3. Ventas y Rentabilidad
  getReporteVentas: async (tiendaId: number | null, inicio: string, fin: string): Promise<ReporteVentas> => {
    const params = tiendaId ? { tiendaId, inicio, fin } : { inicio, fin };
    const { data } = await api.get(`${BASE_URL}/ventas`, { params });
    return data;
  },

  // 4. Finanzas y Métodos de Pago
  getFlujoPagos: async (tiendaId: number | null, inicio: string, fin: string): Promise<FlujoPago[]> => {
    const params = tiendaId ? { tiendaId, inicio, fin } : { inicio, fin };
    const { data } = await api.get(`${BASE_URL}/finanzas/metodos-pago`, { params });
    return data;
  },

  // 5. Compras y Deudas
  getReporteCompras: async (tiendaId: number | null, inicio: string, fin: string): Promise<ReporteCompras> => {
    const params = tiendaId ? { tiendaId, inicio, fin } : { inicio, fin };
    const { data } = await api.get(`${BASE_URL}/compras`, { params });
    return data;
  }
};