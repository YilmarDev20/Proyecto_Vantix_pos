package com.vantix.pos.modules.catalog.variant.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.product.repository.ProductoRepository;
import com.vantix.pos.modules.catalog.variant.dto.VarianteRequestDTO;
import com.vantix.pos.modules.catalog.variant.dto.VarianteResponseDTO;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.entity.VariantePresentacion;
import com.vantix.pos.modules.catalog.variant.mapper.VarianteMapper;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.catalog.variant.service.VarianteService;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;
import com.vantix.pos.modules.store.entity.Tienda;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VarianteServiceImpl implements VarianteService {

    private final VarianteRepository varianteRepository;
    private final ProductoRepository productoRepository;
    private final VarianteMapper varianteMapper;
    private final InventarioTiendaRepository inventarioTiendaRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<VarianteResponseDTO> obtenerTodas(Integer tiendaId) {
        return varianteRepository.findAll().stream()
                .map(variante -> {
                    VarianteResponseDTO dto = varianteMapper.toDto(variante);

                    // Extraer Inventario (Stock Actual y Mínimo)
                    InventarioTienda inventario = inventarioTiendaRepository
                            .findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                            .orElse(null);

                    dto.setStockActual(inventario != null ? inventario.getStockActual() : 0);
                    dto.setStockMinimo(inventario != null ? inventario.getStockMinimo() : 5);

                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VarianteResponseDTO obtenerPorId(Integer id) {
        Variante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));
        return varianteMapper.toDto(variante);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VarianteResponseDTO> obtenerPorProducto(Integer productoId, Integer tiendaId) {
        return varianteRepository.findByProductoId(productoId).stream()
                .map(variante -> {
                    VarianteResponseDTO dto = varianteMapper.toDto(variante);

                    InventarioTienda inventario = inventarioTiendaRepository
                            .findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                            .orElse(null);

                    dto.setStockActual(inventario != null ? inventario.getStockActual() : 0);
                    dto.setStockMinimo(inventario != null ? inventario.getStockMinimo() : 5);

                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VarianteResponseDTO crear(VarianteRequestDTO requestDTO, Integer tiendaIdParam) {
        // ✅ VALIDACIÓN DE RAÍZ: Evita pérdidas marginando precios inválidos en la creación
        if (requestDTO.getPrecioVenta() != null && requestDTO.getPrecioCompra() != null &&
                requestDTO.getPrecioVenta().compareTo(requestDTO.getPrecioCompra()) < 0) {
            throw new IllegalArgumentException("El precio de venta no puede ser menor que el costo de compra.");
        }

        Variante variante = varianteMapper.toEntity(requestDTO);
        variante.setEstado(true);
        variante.setCostoPromedio(requestDTO.getPrecioCompra());

        Producto producto = productoRepository.findById(requestDTO.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto padre no encontrado con ID: " + requestDTO.getProductoId()));
        variante.setProducto(producto);

        if (requestDTO.getSku() == null || requestDTO.getSku().isBlank()) {
            variante.setSku(generarSku(producto));
        }

        if (requestDTO.getCodigoBarras() == null || requestDTO.getCodigoBarras().isBlank()) {
            variante.setCodigoBarras(generarCodigoBarrasUnico());
        } else {
            if (varianteRepository.existsByCodigoBarras(requestDTO.getCodigoBarras())) {
                throw new IllegalArgumentException("El código de barras ingresado ya está registrado en otro producto.");
            }
            variante.setCodigoBarras(requestDTO.getCodigoBarras());
        }

        if (requestDTO.getPresentaciones() != null && !requestDTO.getPresentaciones().isEmpty()) {
            for (VarianteRequestDTO.PresentacionReqDTO pReq : requestDTO.getPresentaciones()) {
                VariantePresentacion vp = VariantePresentacion.builder()
                        .nombre(pReq.getNombre())
                        .codigoBarras(pReq.getCodigoBarras() != null && !pReq.getCodigoBarras().isBlank() ? pReq.getCodigoBarras() : generarCodigoBarrasUnico())
                        .factorConversion(pReq.getFactorConversion())
                        .precioVenta(pReq.getPrecioVenta())
                        .estado(true)
                        .build();
                variante.addPresentacion(vp);
            }
        }

        // 1. Guardamos la variante base
        Variante varianteGuardada = varianteRepository.save(variante);

        // 2. BUENA PRÁCTICA: Inicializar el InventarioTienda al nacer el producto
        Integer tiendaId = (tiendaIdParam != null) ? tiendaIdParam : SecurityUtils.getTiendaId();

        InventarioTienda inventarioInicial = new InventarioTienda();
        inventarioInicial.setVariante(varianteGuardada);

        // Uso de proxy para evitar una consulta SELECT a la tabla Tienda (Optimización de Rendimiento)
        Tienda tiendaProxy = new Tienda();
        tiendaProxy.setId(tiendaId);
        inventarioInicial.setTienda(tiendaProxy);

        inventarioInicial.setStockActual(0);
        inventarioInicial.setStockMinimo(requestDTO.getStockMinimo() != null ? requestDTO.getStockMinimo() : 5);

        inventarioTiendaRepository.save(inventarioInicial);

        // 3. Mapeo final
        VarianteResponseDTO responseDTO = varianteMapper.toDto(varianteGuardada);
        responseDTO.setStockActual(inventarioInicial.getStockActual());
        responseDTO.setStockMinimo(inventarioInicial.getStockMinimo());

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(tiendaId)
                .modulo("CATALOGO_VARIANTE").accion("CREAR")
                .entidadId(varianteGuardada.getId())
                .descripcion("Se creó una nueva variante (SKU: " + varianteGuardada.getSku() + ")")
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public VarianteResponseDTO actualizar(Integer id, VarianteRequestDTO requestDTO, Integer tiendaIdParam) {
        // ✅ VALIDACIÓN DE RAÍZ: Evita pérdidas marginando precios inválidos en la actualización
        if (requestDTO.getPrecioVenta() != null && requestDTO.getPrecioCompra() != null &&
                requestDTO.getPrecioVenta().compareTo(requestDTO.getPrecioCompra()) < 0) {
            throw new IllegalArgumentException("El precio de venta no puede ser menor que el costo de compra.");
        }

        Variante varianteAnterior = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));

        VarianteResponseDTO fotoAnterior = varianteMapper.toDto(varianteAnterior);

        // 1. Validación de unicidad de código de barras
        if (requestDTO.getCodigoBarras() != null && !requestDTO.getCodigoBarras().isBlank()) {
            if (varianteRepository.existsByCodigoBarrasAndIdNot(requestDTO.getCodigoBarras(), id)) {
                throw new IllegalArgumentException("El código de barras ingresado ya está siendo usado por otro producto.");
            }
        } else {
            requestDTO.setCodigoBarras(generarCodigoBarrasUnico());
        }

        // 2. Mapeo de datos principales
        varianteMapper.updateEntityFromDto(requestDTO, varianteAnterior);
        varianteAnterior.setCostoPromedio(requestDTO.getPrecioCompra()); // Actualización de costo en variante

        Producto producto = productoRepository.findById(requestDTO.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto padre no encontrado con ID: " + requestDTO.getProductoId()));
        varianteAnterior.setProducto(producto);

        // 3. BUENA PRÁCTICA: Sincronización limpia de colecciones (Orphan Removal Safe)
        if (requestDTO.getPresentaciones() != null) {

            // Extraer IDs que vienen del Frontend
            Set<Integer> idsRequest = requestDTO.getPresentaciones().stream()
                    .filter(p -> p.getId() != null)
                    .map(VarianteRequestDTO.PresentacionReqDTO::getId)
                    .collect(Collectors.toSet());

            // Eliminar empaques que el usuario borró en la vista
            varianteAnterior.getPresentaciones().removeIf(p -> p.getId() != null && !idsRequest.contains(p.getId()));

            // Actualizar existentes o agregar nuevos
            for (VarianteRequestDTO.PresentacionReqDTO pReq : requestDTO.getPresentaciones()) {
                if (pReq.getId() != null) {
                    varianteAnterior.getPresentaciones().stream()
                            .filter(p -> p.getId().equals(pReq.getId()))
                            .findFirst()
                            .ifPresent(vp -> {
                                vp.setNombre(pReq.getNombre());
                                vp.setCodigoBarras(pReq.getCodigoBarras() != null && !pReq.getCodigoBarras().isBlank() ? pReq.getCodigoBarras() : vp.getCodigoBarras());
                                vp.setFactorConversion(pReq.getFactorConversion());
                                vp.setPrecioVenta(pReq.getPrecioVenta());
                            });
                } else {
                    VariantePresentacion vpNuevo = VariantePresentacion.builder()
                            .nombre(pReq.getNombre())
                            .codigoBarras(pReq.getCodigoBarras() != null && !pReq.getCodigoBarras().isBlank() ? pReq.getCodigoBarras() : generarCodigoBarrasUnico())
                            .factorConversion(pReq.getFactorConversion())
                            .precioVenta(pReq.getPrecioVenta())
                            .estado(true)
                            .build();
                    varianteAnterior.addPresentacion(vpNuevo);
                }
            }
        } else {
            varianteAnterior.getPresentaciones().clear();
        }

        // 4. Guardado de variante
        Variante varianteActualizada = varianteRepository.save(varianteAnterior);

        // 5. BUENA PRÁCTICA: Actualización del Stock Mínimo en su tabla correcta
        Integer tiendaId = (tiendaIdParam != null) ? tiendaIdParam : SecurityUtils.getTiendaId();

        InventarioTienda inventario = inventarioTiendaRepository
                .findByVarianteIdAndTiendaId(varianteActualizada.getId(), tiendaId)
                .orElseGet(() -> {
                    InventarioTienda nuevoInventario = new InventarioTienda();
                    nuevoInventario.setVariante(varianteActualizada);

                    Tienda tiendaProxy = new Tienda();
                    tiendaProxy.setId(tiendaId);
                    nuevoInventario.setTienda(tiendaProxy);

                    nuevoInventario.setStockActual(0);
                    return nuevoInventario;
                });

        if (requestDTO.getStockMinimo() != null) {
            inventario.setStockMinimo(requestDTO.getStockMinimo());
        }
        inventarioTiendaRepository.save(inventario);

        // 6. Preparar DTO de respuesta
        VarianteResponseDTO fotoNueva = varianteMapper.toDto(varianteActualizada);
        fotoNueva.setStockActual(inventario.getStockActual());
        fotoNueva.setStockMinimo(inventario.getStockMinimo());

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(tiendaId)
                .modulo("CATALOGO_VARIANTE").accion("ACTUALIZAR")
                .entidadId(varianteActualizada.getId())
                .descripcion("Se actualizaron datos o empaques de la variante (SKU: " + varianteActualizada.getSku() + ")")
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Variante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));

        VarianteResponseDTO fotoAnterior = varianteMapper.toDto(variante);

        inventarioTiendaRepository.deleteByVarianteId(id);
        varianteRepository.delete(variante);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_VARIANTE").accion("ELIMINAR_PERMANENTE")
                .entidadId(id)
                .descripcion("Se eliminó permanentemente la variante (SKU: " + variante.getSku() + ")")
                .valorAnterior(fotoAnterior).valorNuevo(null).direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public VarianteResponseDTO cambiarEstado(Integer id) {
        Variante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));

        VarianteResponseDTO fotoAnterior = varianteMapper.toDto(variante);

        // Soft Delete / Toggle
        variante.setEstado(!variante.getEstado());
        Variante varianteActualizada = varianteRepository.save(variante);
        VarianteResponseDTO fotoNueva = varianteMapper.toDto(varianteActualizada);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_VARIANTE").accion("CAMBIO_ESTADO")
                .entidadId(varianteActualizada.getId())
                .descripcion("Se cambió el estado a " + (varianteActualizada.getEstado() ? "ACTIVO" : "INACTIVO") + " (SKU: " + varianteActualizada.getSku() + ")")
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    private String generarSku(Producto producto) {
        String prefijo = producto.getCategoria() != null ? producto.getCategoria().getCodigoPrefijo() : "GEN";
        String uuidCorto = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefijo + "-" + producto.getId() + "-" + uuidCorto;
    }

    private String generarCodigoBarrasUnico() {
        String codigoGenerado;
        do {
            StringBuilder sb = new StringBuilder("200");
            for (int i = 0; i < 9; i++) {
                sb.append((int) (Math.random() * 10));
            }
            String base12 = sb.toString();
            int checksum = calcularChecksumEAN13(base12);
            codigoGenerado = base12 + checksum;
        } while (varianteRepository.existsByCodigoBarras(codigoGenerado));

        return codigoGenerado;
    }

    private int calcularChecksumEAN13(String base12) {
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(base12.charAt(i));
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int checksum = 10 - (sum % 10);
        return checksum == 10 ? 0 : checksum;
    }
}