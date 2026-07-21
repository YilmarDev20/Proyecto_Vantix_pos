package com.vantix.pos.publico.catalog.service;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;
import com.vantix.pos.publico.catalog.dto.CatalogoWebResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicCatalogService {

    private final VarianteRepository varianteRepository;
    private final InventarioTiendaRepository inventarioTiendaRepository;

    @Transactional(readOnly = true)
    public List<CatalogoWebResponseDTO> obtenerCatalogoPublico(Integer tiendaId) {
        return varianteRepository.findAll().stream()
                // 1. Filtrar solo las variantes que estén activadas administrativamente
                .filter(Variante::getEstado)
                .map(variante -> {
                    // Consultar stock específico para la tienda solicitada
                    InventarioTienda inventario = inventarioTiendaRepository
                            .findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                            .orElse(null);

                    int stock = (inventario != null) ? inventario.getStockActual() : 0;

                    // Mapear manualmente al DTO seguro (Evitamos exponer costos)
                    CatalogoWebResponseDTO dto = new CatalogoWebResponseDTO();
                    dto.setId(variante.getId());
                    dto.setProductoId(variante.getProducto() != null ? variante.getProducto().getId() : null);
                    dto.setProductoNombre(variante.getProducto() != null ? variante.getProducto().getNombre() : null);

                    // ✅ CIRUGÍA SOLUCIONADA: getMarca() ya entrega el String directo del producto padre de forma segura
                    String nombreMarca = (variante.getProducto() != null) ? variante.getProducto().getMarca() : null;
                    dto.setMarcaNombre(nombreMarca);

                    dto.setSku(variante.getSku());
                    dto.setCodigoBarras(variante.getCodigoBarras());
                    dto.setAtributos(variante.getAtributos());
                    dto.setPrecioVenta(variante.getPrecioVenta());
                    dto.setPrecioMayorista(variante.getPrecioMayorista());
                    dto.setCantidadMayorista(variante.getCantidadMayorista());
                    dto.setPrecioOferta(variante.getPrecioOferta());
                    dto.setImagenUrl(variante.getImagenUrl());
                    dto.setStockActual(stock);

                    // Mapear presentaciones activas del empaque
                    if (variante.getPresentaciones() != null) {
                        List<CatalogoWebResponseDTO.PresentacionPublicaDTO> listaPres = variante.getPresentaciones().stream()
                                .filter(p -> p.getEstado() != null && p.getEstado())
                                .map(p -> {
                                    CatalogoWebResponseDTO.PresentacionPublicaDTO pDto = new CatalogoWebResponseDTO.PresentacionPublicaDTO();
                                    pDto.setId(p.getId());
                                    pDto.setNombre(p.getNombre());
                                    pDto.setCodigoBarras(p.getCodigoBarras());
                                    pDto.setFactorConversion(p.getFactorConversion());
                                    pDto.setPrecioVenta(p.getPrecioVenta());
                                    return pDto;
                                }).collect(Collectors.toList());
                        dto.setPresentaciones(listaPres);
                    }

                    return dto;
                })
                // 2. Filtrar para la web únicamente lo que posea disponibilidad física real en góndola
                .filter(dto -> dto.getStockActual() > 0)
                .collect(Collectors.toList());
    }
}