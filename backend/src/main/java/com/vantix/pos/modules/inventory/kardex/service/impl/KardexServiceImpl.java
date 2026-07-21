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

    private KardexResponseDTO enriquecerKardexDTO(InventarioKardex kardex) {
        KardexResponseDTO dto = kardexMapper.toDto(kardex);
        Variante v = kardex.getVariante();

        StringBuilder sb = new StringBuilder(v.getProducto().getNombre());
        if (v.getProducto().getMarca() != null && !v.getProducto().getMarca().isBlank()) {
            sb.append(" [").append(v.getProducto().getMarca()).append("]");
        }

        if (v.getAtributos() != null && !v.getAtributos().isEmpty()) {
            String attrs = v.getAtributos().values().stream()
                    .map(Object::toString)
                    .filter(val -> !val.isBlank())
                    .collect(Collectors.joining(" "));
            if (!attrs.isBlank()) {
                sb.append(" - ").append(attrs);
            }
        }
        dto.setVarianteNombre(sb.toString());
        dto.setTiendaId(kardex.getTiendaId());

        // 🚀 EXTRACCIÓN INTELIGENTE: Si la nota interna contiene la firma del empaque, la separamos
        String notaOriginal = kardex.getNotasInternas();
        if (notaOriginal != null && notaOriginal.contains("||EMP:")) {
            try {
                int indexEmp = notaOriginal.indexOf("||EMP:");
                String metadata = notaOriginal.substring(indexEmp + 6); // Extrae "Paquete|FAC:500"
                String[] parts = metadata.split("\\|FAC:");

                dto.setPresentacionNombre(parts[0]);
                dto.setFactorConversion(Integer.parseInt(parts[1]));

                // Devolvemos la nota limpia del operador a la columna NOTES
                String notaLimpia = notaOriginal.substring(0, indexEmp).trim();
                dto.setNotasInternas(notaLimpia.isEmpty() ? "-" : notaLimpia);
            } catch (Exception e) {
                dto.setPresentacionNombre(null);
                dto.setFactorConversion(1);
            }
        } else {
            dto.setPresentacionNombre(null);
            dto.setFactorConversion(1);
        }

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

            int factor = ajuste.getFactorConversion() != null ? ajuste.getFactorConversion() : 1;
            int cantidadUnidadesFisicas = ajuste.getCantidad() * factor;

            int stockActual = inventario.getStockActual();
            int nuevoStock;

            if (ajuste.getTipoMovimiento() == TipoMovimiento.ENTRADA) {
                nuevoStock = stockActual + cantidadUnidadesFisicas;
            } else {
                nuevoStock = stockActual - cantidadUnidadesFisicas;
                if (nuevoStock < 0) {
                    throw new IllegalArgumentException("Stock local insuficiente para salida en: " + variante.getSku());
                }
            }

            inventario.setStockActual(nuevoStock);
            inventarioTiendaRepository.save(inventario);

            // 🚀 PERSISTENCIA OCULTA: Guardamos la firma al final de la nota usando un separador especial "||EMP:"
            String notaOperador = (ajuste.getNotas() != null) ? ajuste.getNotas().trim() : "";
            String empaqueEtiqueta = (ajuste.getPresentacionNombre() != null) ? ajuste.getPresentacionNombre() : "Unidades";
            String notaFinalConFirma = notaOperador + "||EMP:" + empaqueEtiqueta + "|FAC:" + factor;

            InventarioKardex kardex = InventarioKardex.builder()
                    .variante(variante)
                    .tiendaId(tienda.getId())
                    .usuarioId(requestDTO.getUsuarioId() != null ? requestDTO.getUsuarioId() : SecurityUtils.getUsuarioId())
                    .tipoMovimiento(ajuste.getTipoMovimiento())
                    .cantidad(cantidadUnidadesFisicas)
                    .stockResultante(nuevoStock)
                    .origenMovimiento(requestDTO.getOrigen())
                    .esAutogenerado(false)
                    .notasInternas(notaFinalConFirma)
                    .build();

            kardexRepository.save(kardex);
        }
    }
}