package com.vantix.pos.modules.reports.inventory.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vantix.pos.modules.reports.inventory.dto.InventarioPredictivoDTO;
import com.vantix.pos.modules.reports.inventory.repository.ReporteInventarioRepository;
import com.vantix.pos.modules.reports.inventory.repository.projection.InventarioStockProjection;
import com.vantix.pos.modules.reports.inventory.service.ReporteInventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteInventarioServiceImpl implements ReporteInventarioService {

    private final ReporteInventarioRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<InventarioPredictivoDTO> generarReportePredictivo(Integer tiendaId, Integer diasAnalisis) {
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(diasAnalisis);
        List<InventarioStockProjection> datosCrudos = repository.analizarComportamientoInventario(tiendaId, fechaInicio);
        List<InventarioPredictivoDTO> reporte = new ArrayList<>();

        for (InventarioStockProjection raw : datosCrudos) {
            StringBuilder nombreCompleto = new StringBuilder(raw.getNombreProducto());
            if (raw.getMarca() != null && !raw.getMarca().trim().isEmpty()) {
                nombreCompleto.append(" [").append(raw.getMarca()).append("]");
            }
            if (raw.getAtributosJson() != null && !raw.getAtributosJson().equals("null")) {
                try {
                    Map<String, Object> atributos = objectMapper.readValue(raw.getAtributosJson(), new TypeReference<>() {});
                    if (!atributos.isEmpty()) nombreCompleto.append(" - ").append(String.join(", ", atributos.values().stream().map(Object::toString).toList()));
                } catch (Exception ignored) {}
            }

            BigDecimal costo = raw.getCosto() != null ? raw.getCosto() : BigDecimal.ZERO;
            BigDecimal precio = raw.getPrecio() != null ? raw.getPrecio() : BigDecimal.ZERO;
            Double margen = 0.0;
            if (precio.compareTo(BigDecimal.ZERO) > 0) {
                margen = precio.subtract(costo).divide(precio, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
            }

            int stock = raw.getStockActual() != null ? raw.getStockActual() : 0;
            int stockMinimo = raw.getStockMinimo() != null ? raw.getStockMinimo() : 0;
            boolean isBajoStockMinimo = stock <= stockMinimo; // AQUÍ EVALUAMOS EL STOCK FÍSICO

            int ventas = raw.getVentasTotales() != null ? raw.getVentasTotales() : 0;
            double promedioDiario = 0.0;
            int diasRestantes = 999;
            String alerta;

            if (ventas == 0) {
                alerta = isBajoStockMinimo ? "CRÍTICO (Bajo Stock Mínimo)" : "ESTANCADO";
            } else {
                promedioDiario = (double) ventas / diasAnalisis;
                diasRestantes = (int) (stock / promedioDiario);
                if (stock == 0 || diasRestantes <= 7 || isBajoStockMinimo) {
                    alerta = "CRÍTICO (Comprar ya)";
                } else if (diasRestantes <= 15) {
                    alerta = "PRECAUCIÓN (Planear compra)";
                } else {
                    alerta = "SANO";
                }
            }

            reporte.add(InventarioPredictivoDTO.builder()
                    .varianteId(raw.getVarianteId()).sku(raw.getSku()).nombreFormateado(nombreCompleto.toString())
                    .costo(costo).precio(precio).margenGanancia(Math.round(margen * 100.0) / 100.0)
                    .stockActual(stock).stockMinimo(stockMinimo).isBajoStockMinimo(isBajoStockMinimo)
                    .ventasUltimosDias(ventas).promedioDiarioVentas(Math.round(promedioDiario * 100.0) / 100.0)
                    .diasRestantesEstimados(diasRestantes).estadoAlerta(alerta).build());
        }
        return reporte;
    }
}