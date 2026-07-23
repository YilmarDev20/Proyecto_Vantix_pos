package com.vantix.pos.publico.catalog.service.impl;

import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.product.entity.PackSurtido;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;
import com.vantix.pos.modules.store.entity.Tienda;
import com.vantix.pos.modules.store.repository.TiendaRepository;
import com.vantix.pos.publico.catalog.dto.ProductoPadreWebDTO;
import com.vantix.pos.publico.catalog.service.PublicCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicCatalogServiceImpl implements PublicCatalogService {

    private final VarianteRepository varianteRepository;
    private final InventarioTiendaRepository inventarioTiendaRepository;
    private final TiendaRepository tiendaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductoPadreWebDTO> obtenerCatalogoPublico(Integer tiendaId) {
        // 1. Obtener todas las variantes públicas para web
        List<Variante> variantesPublicas = varianteRepository.findAllPublicasParaWeb();

        // 2. Agrupar las variantes por su Producto Padre
        Map<Producto, List<Variante>> variantesPorProducto = variantesPublicas.stream()
                .filter(v -> v.getProducto() != null && Boolean.TRUE.equals(v.getProducto().getPublicadoEnWeb()))
                .collect(Collectors.groupingBy(Variante::getProducto));

        List<ProductoPadreWebDTO> catalogoWeb = new ArrayList<>();

        for (Map.Entry<Producto, List<Variante>> entry : variantesPorProducto.entrySet()) {
            Producto producto = entry.getKey();
            List<Variante> variantes = entry.getValue();

            List<ProductoPadreWebDTO.VarianteWebDTO> variantesDTO = new ArrayList<>();
            int stockTotalProducto = 0;
            BigDecimal minPrecio = null;
            BigDecimal maxPrecio = null;

            for (Variante variante : variantes) {
                // Stock específico por tienda consultada
                InventarioTienda inventario = inventarioTiendaRepository
                        .findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                        .orElse(null);

                int stockVariante = (inventario != null) ? inventario.getStockActual() : 0;
                stockTotalProducto += stockVariante;

                // Determinar precio efectivo (Oferta o Regular)
                BigDecimal precioEfectivo = (variante.getPrecioOferta() != null && variante.getPrecioOferta().compareTo(BigDecimal.ZERO) > 0)
                        ? variante.getPrecioOferta()
                        : variante.getPrecioVenta();

                if (minPrecio == null || precioEfectivo.compareTo(minPrecio) < 0) minPrecio = precioEfectivo;
                if (maxPrecio == null || precioEfectivo.compareTo(maxPrecio) > 0) maxPrecio = precioEfectivo;

                // Mapear presentaciones activas Y PUBLICADAS EN WEB
                List<ProductoPadreWebDTO.PresentacionWebDTO> presentacionesDTO = Collections.emptyList();
                if (variante.getPresentaciones() != null) {
                    presentacionesDTO = variante.getPresentaciones().stream()
                            .filter(p -> Boolean.TRUE.equals(p.getEstado()) && Boolean.TRUE.equals(p.getPublicadoEnWeb()))
                            .map(p -> ProductoPadreWebDTO.PresentacionWebDTO.builder()
                                    .id(p.getId())
                                    .nombre(p.getNombre())
                                    .codigoBarras(p.getCodigoBarras())
                                    .factorConversion(p.getFactorConversion())
                                    .precioVenta(p.getPrecioVenta())
                                    .build())
                            .collect(Collectors.toList());
                }

                // Disponibilidad cualitativa Y NUMÉRICA por sedes para la variante
                List<ProductoPadreWebDTO.DisponibilidadSedeDTO> disponibilidadesVariante = calcularDisponibilidadSedes(variante.getId());

                // Construir DTO de Variante
                variantesDTO.add(ProductoPadreWebDTO.VarianteWebDTO.builder()
                        .id(variante.getId())
                        .sku(variante.getSku())
                        .codigoBarras(variante.getCodigoBarras())
                        .nombreVariante(construirNombreVariante(variante))
                        .atributos(variante.getAtributos())
                        .precioVenta(variante.getPrecioVenta())
                        .precioOferta(variante.getPrecioOferta())
                        .precioMayorista(variante.getPrecioMayorista())
                        .cantidadMayorista(variante.getCantidadMayorista())
                        .imagenUrl(variante.getImagenUrl() != null ? variante.getImagenUrl() : producto.getImagenUrl())
                        .stockActual(stockVariante)
                        .presentaciones(presentacionesDTO)
                        .disponibilidadesSedes(disponibilidadesVariante)
                        .build());
            }

            // Mostrar si el producto tiene precio base
            if (minPrecio != null) {
                // Mapear Packs Surtidos activos
                List<ProductoPadreWebDTO.PackSurtidoWebDTO> packsDTO = Collections.emptyList();
                if (producto.getPacksSurtidos() != null) {
                    packsDTO = producto.getPacksSurtidos().stream()
                            .filter(p -> Boolean.TRUE.equals(p.getEstado()))
                            .map(p -> ProductoPadreWebDTO.PackSurtidoWebDTO.builder()
                                    .id(p.getId())
                                    .nombre(p.getNombre())
                                    .cantidadRequerida(p.getCantidadRequerida())
                                    .precioPack(p.getPrecioPack())
                                    .build())
                            .collect(Collectors.toList());
                }

                // Disponibilidad cualitativa Y NUMÉRICA general del Producto Padre
                List<ProductoPadreWebDTO.DisponibilidadSedeDTO> disponibilidadesPadre = !variantes.isEmpty()
                        ? calcularDisponibilidadSedes(variantes.get(0).getId())
                        : Collections.emptyList();

                catalogoWeb.add(ProductoPadreWebDTO.builder()
                        .id(producto.getId())
                        .nombre(producto.getNombre())
                        .descripcion(producto.getDescripcion())
                        .marca(producto.getMarca())
                        .imagenUrl(producto.getImagenUrl())
                        .categoriaId(producto.getCategoria() != null ? producto.getCategoria().getId() : null)
                        .categoriaNombre(producto.getCategoria() != null ? producto.getCategoria().getNombre() : null)
                        .etiquetas(producto.getEtiquetas())
                        .precioDesde(minPrecio)
                        .precioHasta(maxPrecio)
                        .stockTotalTienda(stockTotalProducto)
                        .variantes(variantesDTO)
                        .packsSurtidos(packsDTO)
                        .disponibilidadesSedes(disponibilidadesPadre)
                        .build());
            }
        }

        return catalogoWeb;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoPadreWebDTO obtenerProductoPorId(Integer productoId, Integer tiendaId) {
        return obtenerCatalogoPublico(tiendaId).stream()
                .filter(p -> p.getId().equals(productoId))
                .findFirst()
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Producto no encontrado con ID: " + productoId));
    }

    /**
     * Evalúa el stock cualitativo y cuantitativo por sede.
     */
    private List<ProductoPadreWebDTO.DisponibilidadSedeDTO> calcularDisponibilidadSedes(Integer varianteId) {
        List<Tienda> tiendasActivas = tiendaRepository.findAll().stream()
                .filter(t -> Boolean.TRUE.equals(t.getEstado()))
                .collect(Collectors.toList());

        List<ProductoPadreWebDTO.DisponibilidadSedeDTO> disponibilidades = new ArrayList<>();

        for (Tienda tienda : tiendasActivas) {
            InventarioTienda inventario = inventarioTiendaRepository
                    .findByVarianteIdAndTiendaId(varianteId, tienda.getId())
                    .orElse(null);

            int stock = (inventario != null) ? inventario.getStockActual() : 0;
            String estado;

            if (stock > 5) {
                estado = "DISPONIBLE";
            } else if (stock > 0) {
                estado = "ULTIMAS_UNIDADES";
            } else {
                estado = "AGOTADO";
            }

            disponibilidades.add(ProductoPadreWebDTO.DisponibilidadSedeDTO.builder()
                    .tiendaId(tienda.getId())
                    .tiendaNombre(tienda.getNombre())
                    .estadoStock(estado)
                    .stock(stock) // 🚀 CORRECCIÓN CLAVE: Envía el entero real del inventario
                    .build());
        }

        return disponibilidades;
    }

    private String construirNombreVariante(Variante variante) {
        if (variante.getAtributos() != null && !variante.getAtributos().isEmpty()) {
            return variante.getAtributos().values().stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(" - "));
        }
        return "Estándar";
    }
}