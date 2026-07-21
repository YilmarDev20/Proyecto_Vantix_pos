import { publicCatalogService } from "@/config/api";
import { CatalogoWebResponseDTO } from "../types/catalog.types";

export const catalogService = {
  /**
   * Obtiene y procesa los productos del catálogo filtrados por la tienda seleccionada
   * @param tiendaId ID de la sede
   */
  cargarProductosTienda: async (tiendaId: number): Promise<CatalogoWebResponseDTO[]> => {
    if (!tiendaId) return [];
    
    // Consumimos el cliente HTTP global
    return await publicCatalogService.obtenerProductosPorTienda(tiendaId);
  }
};