import { api } from '@/config/api';
import type { AbonoRequest, AbonoResponse } from '../types/abono.types';

const ABONOS_URL = '/abonos';

export const AbonoService = {
  registrarAbono: async (request: AbonoRequest): Promise<AbonoResponse> => {
    const { data } = await api.post(ABONOS_URL, request);
    return data;
  },

  obtenerHistorial: async (clienteId: number): Promise<AbonoResponse[]> => {
    const { data } = await api.get(`${ABONOS_URL}/cliente/${clienteId}`);
    return data;
  },

  anularAbono: async (abonoId: number): Promise<void> => {
    await api.patch(`${ABONOS_URL}/${abonoId}/anular`);
  }
};