package com.vantix.pos.modules.reports.service.impl;

import com.vantix.pos.modules.reports.dto.ReporteVentasDTO;
import com.vantix.pos.modules.reports.repository.ReporteVentasRepository;
import com.vantix.pos.modules.reports.service.ReporteVentasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteVentasServiceImpl implements ReporteVentasService {

    private final ReporteVentasRepository reporteVentasRepository;

    @Override
    @Transactional(readOnly = true)
    public ReporteVentasDTO generarReporteVentas(Integer tiendaId, LocalDateTime inicio, LocalDateTime fin) {

        // CÁLCULOS SEPARADOS = PRECISIÓN ABSOLUTA
        BigDecimal ventas = reporteVentasRepository.calcularVentasTotales(tiendaId, inicio, fin);
        BigDecimal costos = reporteVentasRepository.calcularCostosTotales(tiendaId, inicio, fin);
        BigDecimal utilidad = ventas.subtract(costos);

        var rankingVendedores = reporteVentasRepository.obtenerRankingVendedores(tiendaId, inicio, fin, PageRequest.of(0, 10))
                .stream().map(proj -> ReporteVentasDTO.VendedorRankingDTO.builder()
                        .nombreVendedor(proj.getNombre())
                        .totalVendido(proj.getTotalVendido())
                        .cantidadOperaciones(proj.getCantidadOperaciones())
                        .build()).collect(Collectors.toList());

        var mejoresClientes = reporteVentasRepository.obtenerMejoresClientes(tiendaId, inicio, fin, PageRequest.of(0, 10))
                .stream().map(proj -> ReporteVentasDTO.ClienteValorDTO.builder()
                        .id(proj.getId()).documento(proj.getDocumento())
                        .nombre(proj.getNombre()).monto(proj.getMonto())
                        .build()).collect(Collectors.toList());

        var deudores = reporteVentasRepository.obtenerDeudoresExactos(tiendaId, PageRequest.of(0, 15))
                .stream().map(proj -> ReporteVentasDTO.ClienteValorDTO.builder()
                        .id(proj.getId()).documento(proj.getDocumento())
                        .nombre(proj.getNombre()).monto(proj.getMonto())
                        .build()).collect(Collectors.toList());

        return ReporteVentasDTO.builder()
                .ventasTotales(ventas)
                .costoTotalInventario(costos)
                .utilidadNeta(utilidad)
                .rankingVendedores(rankingVendedores)
                .rankingClientes(mejoresClientes)
                .listaDeudores(deudores)
                .build();
    }
}