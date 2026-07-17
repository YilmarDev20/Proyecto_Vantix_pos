package com.vantix.pos.modules.reports.finances.service.impl;

import com.vantix.pos.modules.reports.finances.dto.ReporteFinanzasDTO;
import com.vantix.pos.modules.reports.finances.repository.ReporteFinanzasRepository;
import com.vantix.pos.modules.reports.finances.service.ReporteFinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteFinanzasServiceImpl implements ReporteFinanzasService {

    private final ReporteFinanzasRepository repository;

    @Override
    @Transactional(readOnly = true)
    public ReporteFinanzasDTO generarReporteFinanzas(Integer tiendaId, LocalDateTime inicio, LocalDateTime fin) {

        // ---> TRAEMOS EL FONDO INICIAL <---
        BigDecimal fondoInicial = repository.calcularTotalFondoInicial(tiendaId, inicio, fin);

        BigDecimal ingresos = repository.calcularTotalIngresos(tiendaId, inicio, fin);
        BigDecimal egresos = repository.calcularTotalEgresos(tiendaId, inicio, fin);

        // ---> FÓRMULA MATEMÁTICA DEFINITIVA <---
        BigDecimal saldoNeto = fondoInicial.add(ingresos).subtract(egresos);

        List<ReporteFinanzasDTO.FlujoPagoDTO> distribucion = repository.obtenerDistribucionPagos(tiendaId, inicio, fin)
                .stream().map(proj -> ReporteFinanzasDTO.FlujoPagoDTO.builder()
                        .metodoPago(proj.getMetodoPago()).totalMonto(proj.getTotalMonto()).cantidadOperaciones(proj.getCantidadOperaciones()).build())
                .collect(Collectors.toList());

        List<ReporteFinanzasDTO.MovimientoDetalleDTO> historial = repository.obtenerHistorialMovimientos(tiendaId, inicio, fin)
                .stream().map(proj -> ReporteFinanzasDTO.MovimientoDetalleDTO.builder()
                        .fecha(proj.getFecha()).tipoMovimiento(proj.getTipoMovimiento()).metodoPago(proj.getMetodoPago()).concepto(proj.getConcepto()).monto(proj.getMonto()).build())
                .collect(Collectors.toList());

        return ReporteFinanzasDTO.builder()
                .fondoInicial(fondoInicial) // INYECTAMOS
                .totalIngresos(ingresos)
                .totalEgresos(egresos)
                .saldoNeto(saldoNeto)
                .distribucionPagos(distribucion)
                .historialMovimientos(historial)
                .build();
    }
}