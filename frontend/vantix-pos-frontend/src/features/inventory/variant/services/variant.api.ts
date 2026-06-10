import { api } from '@/config/api';
import type { Variant, VariantRequest } from '../types/variant.types';

const VARIANT_URL = '/variantes';

export const VariantService = {
  // Actualiza solo esta función dentro de tu VariantService
  getAll: async (tiendaId: number): Promise<Variant[]> => {
    const { data } = await api.get(`${VARIANT_URL}?tiendaId=${tiendaId}`);
    return data;
  },

  getById: async (id: number): Promise<Variant> => {
    const { data } = await api.get(`${VARIANT_URL}/${id}`);
    return data;
  },

  // ---> CAMBIO AQUÍ: Ahora recibe tiendaId y lo manda como query param <---
  getByProduct: async (productoId: number, tiendaId: number): Promise<Variant[]> => {
    // Esto llamará a: /api/v1/variantes/producto/1?tiendaId=2
    const { data } = await api.get(`${VARIANT_URL}/producto/${productoId}?tiendaId=${tiendaId}`);
    return data;
  },

  create: async (variant: VariantRequest, tiendaId: number): Promise<Variant> => {
  const { data } = await api.post(`${VARIANT_URL}?tiendaId=${tiendaId}`, variant);
  return data;
  },

  update: async (id: number, variant: VariantRequest, tiendaId: number): Promise<Variant> => {
  const { data } = await api.put(`${VARIANT_URL}/${id}?tiendaId=${tiendaId}`, variant);
  return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${VARIANT_URL}/${id}`);
  },

  toggleStatus: async (id: number): Promise<Variant> => {
    const { data } = await api.patch(`${VARIANT_URL}/${id}/estado`);
    return data;
  },
  // Pasamos el tiendaId de forma dinámica si el componente lo requiere
  exportExcel: async (tiendaId?: number): Promise<Blob> => {
    const url = tiendaId ? `${VARIANT_URL}/exportar/excel?tiendaId=${tiendaId}` : `${VARIANT_URL}/exportar/excel`;
    const { data } = await api.get(url, {
      responseType: 'blob'
    });
    return data;
  },

  exportPdf: async (tiendaId?: number): Promise<Blob> => {
    const url = tiendaId ? `${VARIANT_URL}/exportar/pdf?tiendaId=${tiendaId}` : `${VARIANT_URL}/exportar/pdf`;
    const { data } = await api.get(url, {
      responseType: 'blob'
    });
    return data;
  }
};