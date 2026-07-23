package com.vantix.pos.publico.catalog.service;

import com.vantix.pos.publico.catalog.dto.ProductoPadreWebDTO;
import java.util.List;

public interface PublicCatalogService {
    List<ProductoPadreWebDTO> obtenerCatalogoPublico(Integer tiendaId);
    ProductoPadreWebDTO obtenerProductoPorId(Integer productoId, Integer tiendaId);

}