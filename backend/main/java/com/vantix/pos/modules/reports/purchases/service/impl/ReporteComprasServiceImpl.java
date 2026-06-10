package com.vantix.pos.modules.reports.purchases.service.impl;

import com.vantix.pos.modules.reports.purchases.dto.ReporteComprasDTO;
import com.vantix.pos.modules.reports.purchases.repository.ReporteComprasRepository;
import com.vantix.pos.modules.reports.purchases.service.ReporteComprasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteComprasServiceImpl implements ReporteComprasService {

    private final ReporteComprasRepository repository;

    @Override
    @Transactional(readOnly = true)
    public ReporteComprasDTO generarReporteCompras(Integer tiendaId, LocalDateTime inicio, LocalDateTime fin) {

        // 1. Total invertido en el rango de fechas
        BigDecimal totalComprado = repository.calcularTotalComprasRango(tiendaId, inicio, fin);

        // 2. Deuda viva actual (No depende de la fecha, es la foto de hoy)
        BigDecimal deudaTotal = repository.calcularDeudaTotalProveedores(tiendaId);

        // 3. Ranking de Proveedores (A quién le debemos)
        List<ReporteComprasDTO.DeudaProveedorDTO> rankingDeudas = repository.obtenerRankingDeudasProveedores(tiendaId)
                .stream().map(proj -> ReporteComprasDTO.DeudaProveedorDTO.builder()
                        .proveedorNombre(proj.getProveedorNombre())
                        .documento(proj.getDocumento())
                        .montoAdeudado(proj.getMontoAdeudado()).build())
                .collect(Collectors.toList());

        // 4. Inversión distribuida por Categorías
        List<ReporteComprasDTO.InversionCategoriaDTO> inversionCategorias = repository.obtenerInversionPorCategoria(tiendaId, inicio, fin)
                .stream().map(proj -> ReporteComprasDTO.InversionCategoriaDTO.builder()
                        .categoria(proj.getCategoria())
                        .total(proj.getTotal()).build())
                .collect(Collectors.toList());

        // 5. Inversión distribuida por Tiendas (Útil en Visión Global)
        List<ReporteComprasDTO.InversionTiendaDTO> inversionTiendas = repository.obtenerInversionPorTienda(tiendaId, inicio, fin)
                .stream().map(proj -> ReporteComprasDTO.InversionTiendaDTO.builder()
                        .tiendaId(proj.getTiendaId())
                        .total(proj.getTotal()).build())
                .collect(Collectors.toList());

        // 6. Historial detallado de compras (El Libro Mayor para la tabla híbrida)
        List<ReporteComprasDTO.HistorialCompraDTO> historial = repository.obtenerHistorialCompras(tiendaId, inicio, fin)
                .stream().map(proj -> ReporteComprasDTO.HistorialCompraDTO.builder()
                        .fecha(proj.getFecha())
                        .comprobante(proj.getComprobante())
                        .proveedor(proj.getProveedor())
                        .metodoPago(proj.getMetodoPago())
                        .estado(proj.getEstado())
                        .total(proj.getTotal()).build())
                .collect(Collectors.toList());

        // 7. Ensamblar y retornar el DTO maestro al Frontend
        return ReporteComprasDTO.builder()
                .totalComprado(totalComprado)
                .totalDeudaProveedores(deudaTotal)
                .rankingDeudas(rankingDeudas)
                .inversionPorCategoria(inversionCategorias)
                .inversionPorTienda(inversionTiendas)
                .historialCompras(historial)
                .build();
    }
}