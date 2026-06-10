import { api } from '@/config/api';

export const SecurityService = {
  // Solo para el Admin: Trae el PIN y los segundos de vida
  getAdminPin: async (): Promise<{ pinActual: string; segundosRestantes: number }> => {
    const { data } = await api.get('/auth/admin-pin');
    return data;
  },

  // Para el Cajero: Manda el PIN que digitó para ver si es correcto
  verificarPin: async (pin: string): Promise<boolean> => {
    try {
      const { data } = await api.post('/auth/verificar-pin', { pin });
      return data; // Retorna true si es válido
    } catch (error) {
      return false; // Retorna false si expiró o es incorrecto
    }
  }
};