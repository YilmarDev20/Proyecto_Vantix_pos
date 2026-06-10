import { api } from '@/config/api';
import type { 
  TurnoCajaResponse, 
  AperturaCajaRequest, 
  CierreCajaRequest, 
  NuevoMovimientoRequest,
  MovimientoCajaResponse
} from '../types/finances.types';

const BASE_URL = '/finances/caja';

export const FinancesService = {
  getTurnoActivo: async (tiendaId: number): Promise<TurnoCajaResponse | null> => {
    try {
      const { data, status } = await api.get(`${BASE_URL}/activa/${tiendaId}`);
      if (status === 204 || !data) return null;
      return data;
    } catch (error) {
      return null;
    }
  },

  abrirCaja: async (request: AperturaCajaRequest): Promise<TurnoCajaResponse> => {
    const { data } = await api.post(`${BASE_URL}/abrir`, request);
    return data;
  },

  cerrarCaja: async (turnoId: number, request: CierreCajaRequest): Promise<TurnoCajaResponse> => {
    const { data } = await api.post(`${BASE_URL}/${turnoId}/cerrar`, request);
    return data;
  },

  registrarMovimiento: async (turnoId: number, request: NuevoMovimientoRequest): Promise<void> => {
    await api.post(`${BASE_URL}/${turnoId}/movimientos`, request);
  },

  // ---> CAMBIO: Arquitectura limpia para la Visión Global <---
  getHistorialTurnos: async (tiendaId?: number | null): Promise<TurnoCajaResponse[]> => {
    // Si mandamos un null (Visión Global), llamamos a la ruta limpia sin query param
    const url = tiendaId ? `${BASE_URL}/historial?tiendaId=${tiendaId}` : `${BASE_URL}/historial`;
    const { data } = await api.get(url);
    return data;
  },

  getMovimientosPorTurno: async (turnoId: number): Promise<MovimientoCajaResponse[]> => {
    const { data } = await api.get(`${BASE_URL}/${turnoId}/movimientos-detalle`);
    return data;
  }
};