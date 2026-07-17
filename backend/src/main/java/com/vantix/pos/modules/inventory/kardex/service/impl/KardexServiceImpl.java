package com.vantix.pos.modules.inventory.kardex.service.impl;

import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteInventarioDTO;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteMasivoRequestDTO;
import com.vantix.pos.modules.inventory.kardex.dto.KardexResponseDTO;
import com.vantix.pos.modules.inventory.kardex.entity.InventarioKardex;
import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import com.vantix.pos.modules.inventory.kardex.mapper.KardexMapper;
import com.vantix.pos.modules.inventory.kardex.repository.KardexRepository;
import com.vantix.pos.modules.inventory.kardex.service.KardexService;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;
import com.vantix.pos.modules.store.entity.Tienda;
import com.vantix.pos.modules.store.repository.TiendaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KardexServiceImpl implements KardexService {

    private final KardexRepository kardexRepository;
    private final VarianteRepository varianteRepository;
    private final KardexMapper kardexMapper;
    private final InventarioTiendaRepository inventarioTiendaRepository;
    private final TiendaRepository tiendaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<KardexResponseDTO> obtenerHistorialCompleto(Integer tiendaId) {
        // 1. BUENA PRÁCTICA: Cache de nombres de tiendas para evitar N+1
        Map<Integer, String> nombresTiendas = tiendaRepository.findAll().stream()
                .collect(Collectors.toMap(Tienda::getId, Tienda::getNombre));

        List<InventarioKardex> movimientos;

        if (tiendaId == null || tiendaId == 0) {
            movimientos = kardexRepository.findAllByOrderByFechaMovimientoDesc();
        } else {
            movimientos = kardexRepository.findByTiendaIdOrderByFechaMovimientoDesc(tiendaId);
        }

        return movimientos.stream()
                .map(this::enriquecerKardexDTO)
                .peek(dto -> {
                    // Asignar nombre de tienda desde el mapa en memoria
                    String nombre = nombresTiendas.getOrDefault(dto.getTiendaId(), "Tienda #" + dto.getTiendaId());
                    dto.setTiendaNombre(nombre);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<KardexResponseDTO> obtenerHistorialPorVariante(Integer varianteId) {
        return kardexRepository.findByVarianteIdOrderByFechaMovimientoDesc(varianteId)
                .stream()
                .map(this::enriquecerKardexDTO)
                .collect(Collectors.toList());
    }

    /**
     * BUENA PRÁCTICA: Método privado para centralizar la construcción del nombre descriptivo.
     * Así, si cambias el formato del nombre, solo lo haces en un lugar.
     */
    private KardexResponseDTO enriquecerKardexDTO(InventarioKardex kardex) {
        KardexResponseDTO dto = kardexMapper.toDto(kardex);
        Variante v = kardex.getVariante();

        // Armamos el nombre: "Producto [Marca] - Atributo1 Atributo2"
        StringBuilder sb = new StringBuilder(v.getProducto().getNombre());

        if (v.getProducto().getMarca() != null && !v.getProducto().getMarca().isBlank()) {
            sb.append(" [").append(v.getProducto().getMarca()).append("]");
        }

        if (v.getAtributos() != null && !v.getAtributos().isEmpty()) {
            // Unimos los valores de los atributos (Ej: "Rojo XL")
            String attrs = v.getAtributos().values().stream()
                    .map(Object::toString)
                    .filter(val -> !val.isBlank())
                    .collect(Collectors.joining(" "));

            if (!attrs.isBlank()) {
                sb.append(" - ").append(attrs);
            }
        }

        dto.setVarianteNombre(sb.toString());
        dto.setTiendaId(kardex.getTiendaId()); // Aseguramos que el ID viaje para lógica
        return dto;
    }

    @Override
    @Transactional
    public void procesarAjusteMasivo(AjusteMasivoRequestDTO requestDTO) {
        Integer idTienda = requestDTO.getTiendaId() != null ? requestDTO.getTiendaId() : SecurityUtils.getTiendaId();
        Tienda tienda = tiendaRepository.findById(idTienda)
                .orElseThrow(() -> new EntityNotFoundException("Tienda no encontrada: " + idTienda));

        for (AjusteInventarioDTO ajuste : requestDTO.getAjustes()) {
            Variante variante = varianteRepository.findById(ajuste.getVarianteId())
                    .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada: " + ajuste.getVarianteId()));

            InventarioTienda inventario = inventarioTiendaRepository.findByVarianteIdAndTiendaId(variante.getId(), tienda.getId())
                    .orElseGet(() -> InventarioTienda.builder()
                            .variante(variante)
                            .tienda(tienda)
                            .stockActual(0)
                            .stockMinimo(5)
                            .build());

            int stockActual = inventario.getStockActual();
            int nuevoStock;

            if (ajuste.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                nuevoStock = stockActual + ajuste.getCantidad();
            } else {
                nuevoStock = stockActual - ajuste.getCantidad();
                if (nuevoStock < 0) {
                    throw new IllegalArgumentException("Stock local insuficiente para salida en: " + variante.getSku());
                }
            }

            inventario.setStockActual(nuevoStock);
            inventarioTiendaRepository.save(inventario);

            InventarioKardex kardex = InventarioKardex.builder()
                    .variante(variante)
                    .tiendaId(tienda.getId())
                    .usuarioId(requestDTO.getUsuarioId() != null ? requestDTO.getUsuarioId() : SecurityUtils.getUsuarioId())
                    .tipoMovimiento(ajuste.getTipoMovimiento())
                    .cantidad(ajuste.getCantidad())
                    .stockResultante(nuevoStock)
                    .origenMovimiento(requestDTO.getOrigen())
                    .esAutogenerado(false)
                    .notasInternas(ajuste.getNotas())
                    .build();

            kardexRepository.save(kardex);
        }
    }
}