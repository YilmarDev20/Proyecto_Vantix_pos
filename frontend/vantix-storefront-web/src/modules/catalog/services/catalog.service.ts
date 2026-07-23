import { ProductoPadreWebDTO, CategoriaPublicaDTO } from "../types/catalog.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const catalogService = {
  // 🚀 Carga omnicanal unificada si no se envía tiendaId
  async cargarProductosTienda(tiendaId?: number): Promise<ProductoPadreWebDTO[]> {
    const url = tiendaId
      ? `${API_BASE_URL}/api/v1/public/catalog/productos?tiendaId=${tiendaId}`
      : `${API_BASE_URL}/api/v1/public/catalog/productos`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al cargar productos desde la API");
    return response.json();
  },

  async cargarCategoriasPublicas(): Promise<CategoriaPublicaDTO[]> {
    const url = `${API_BASE_URL}/api/v1/public/catalog/categorias`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return response.json();
  },

  // 🚀 Si no hay tiendaId, obtiene el detalle con desglose multi-sede
  async obtenerProductoPorId(productoId: number, tiendaId?: number): Promise<ProductoPadreWebDTO | null> {
    const url = tiendaId
      ? `${API_BASE_URL}/api/v1/public/catalog/productos/${productoId}?tiendaId=${tiendaId}`
      : `${API_BASE_URL}/api/v1/public/catalog/productos/${productoId}`;
      
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json();
  }
};