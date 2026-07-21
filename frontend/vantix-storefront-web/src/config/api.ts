import { CatalogoWebResponseDTO } from "@/modules/catalog/types/catalog.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1/public";

export const publicCatalogService = {
  /**
   * Obtiene el catálogo de productos activos con stock disponibles filtrado por sede
   * @param tiendaId ID de la tienda (1 para Independencia, 2 para Dos Palmares)
   */
  obtenerProductosPorTienda: async (tiendaId: number): Promise<CatalogoWebResponseDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/catalog/productos?tiendaId=${tiendaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, 
      });

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al consultar el catálogo público desde la API:", error);
      return [];
    }
  }
};