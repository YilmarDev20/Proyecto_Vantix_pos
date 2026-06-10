import { api } from '@/config/api';
import type { Product, ProductRequest } from '../types/product.types';

const PRODUCT_URL = '/productos';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get(PRODUCT_URL);
    return data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`${PRODUCT_URL}/${id}`);
    return data;
  },

  create: async (product: ProductRequest): Promise<Product> => {
    const { data } = await api.post(PRODUCT_URL, product);
    return data;
  },

  update: async (id: number, product: ProductRequest): Promise<Product> => {
    const { data } = await api.put(`${PRODUCT_URL}/${id}`, product);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${PRODUCT_URL}/${id}`);
  },

  toggleStatus: async (id: number): Promise<Product> => {
    const { data } = await api.patch(`${PRODUCT_URL}/${id}/estado`);
    return data;
  },
  exportExcel: async (): Promise<Blob> => {
    const { data } = await api.get(`${PRODUCT_URL}/exportar/excel`, {
      responseType: 'blob' // CRÍTICO: Indica a Axios que maneje la respuesta como archivo binario
    });
    return data;
  },

  exportPdf: async (): Promise<Blob> => {
    const { data } = await api.get(`${PRODUCT_URL}/exportar/pdf`, {
      responseType: 'blob'
    });
    return data;
  }
};