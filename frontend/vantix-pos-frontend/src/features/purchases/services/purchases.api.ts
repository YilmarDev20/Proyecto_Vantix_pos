import { api } from '@/config/api';
import type { 
  ProveedorResponse, 
  ProveedorRequest, 
  CompraResponse, 
  NuevaCompraRequest 
} from '../types/purchases.types';

const SUPPLIERS_URL = '/purchases/suppliers';
const TRANSACTIONS_URL = '/purchases/transactions';

export const PurchasesService = {
  // --- PROVEEDORES (No se toca, son globales) ---
  getProveedores: async (): Promise<ProveedorResponse[]> => {
    const { data } = await api.get(`${SUPPLIERS_URL}/todos`); 
    return data;
  },

  crearProveedor: async (request: ProveedorRequest): Promise<ProveedorResponse> => {
    const { data } = await api.post(SUPPLIERS_URL, request);
    return data;
  },

  actualizarProveedor: async (id: number, request: ProveedorRequest): Promise<ProveedorResponse> => {
    const { data } = await api.put(`${SUPPLIERS_URL}/${id}`, request);
    return data;
  },

  cambiarEstadoProveedor: async (id: number, estado: boolean): Promise<void> => {
    await api.patch(`${SUPPLIERS_URL}/${id}/estado?estado=${estado}`);
  },

  // --- COMPRAS ---
  registrarCompra: async (request: NuevaCompraRequest): Promise<CompraResponse> => {
    const { data } = await api.post(TRANSACTIONS_URL, request);
    return data;
  },

  // ---> CAMBIO: Agregamos tiendaId <---
  getHistorialCompras: async (tiendaId: number): Promise<CompraResponse[]> => {
    const { data } = await api.get(`${TRANSACTIONS_URL}?tiendaId=${tiendaId}`);
    return data;
  },

  // ---> CAMBIO: Agregamos tiendaId <---
  getCuentasPorPagar: async (tiendaId: number): Promise<CompraResponse[]> => {
    const { data } = await api.get(`${TRANSACTIONS_URL}/por-pagar?tiendaId=${tiendaId}`);
    return data;
  },

  anularCompra: async (id: number): Promise<void> => {
    await api.patch(`${TRANSACTIONS_URL}/${id}/anular`);
  },

  // --- CUENTAS POR PAGAR ---
  pagarDeuda: async (id: number): Promise<void> => {
    await api.patch(`${TRANSACTIONS_URL}/${id}/pagar`);
  }
};