package com.vantix.pos.modules.dashboard.service.impl;

import com.vantix.pos.modules.dashboard.dto.DashboardResumenDTO;
import com.vantix.pos.modules.dashboard.repository.*;
import com.vantix.pos.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardVentaRepository ventaRepo;
    private final DashboardInventarioRepository inventarioRepo;
    private final DashboardFinanzasRepository finanzasRepo;
    private final DashboardOperacionesRepository operacionesRepo;

    @Override
    @Transactional(readOnly = true)
    public DashboardResumenDTO obtenerResumen(Integer tiendaId, String rango) {
        LocalDateTime inicioActual;
        LocalDateTime finActual;
        LocalDateTime inicioAnterior;
        LocalDateTime finAnterior;

        // ---> LÓGICA DEL FILTRO (HOY vs MES) <---
        if ("MES".equalsIgnoreCase(rango)) {
            // Rango actual: Desde el día 1 de este mes hasta hoy
            inicioActual = LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN);
            finActual = LocalDateTime.now().with(LocalTime.MAX);

            // Rango anterior: Todo el mes pasado (para calcular el % de crecimiento)
            LocalDateTime mesPasado = LocalDateTime.now().minusMonths(1);
            inicioAnterior = mesPasado.withDayOfMonth(1).with(LocalTime.MIN);
            finAnterior = mesPasado.withDayOfMonth(mesPasado.toLocalDate().lengthOfMonth()).with(LocalTime.MAX);
        } else {
            // Por defecto: HOY
            inicioActual = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
            finActual = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

            // Rango anterior: AYER
            inicioAnterior = inicioActual.minusDays(1);
            finAnterior = finActual.minusDays(1);
        }

        // 1. KPIs PRINCIPALES (Responden al filtro de fechas)
        BigDecimal ventasActual = ventaRepo.calcularTotalVentasRango(tiendaId, inicioActual, finActual);
        BigDecimal ventasAnterior = ventaRepo.calcularTotalVentasRango(tiendaId, inicioAnterior, finAnterior);
        Long ticketsActual = ventaRepo.contarTicketsRango(tiendaId, inicioActual, finActual);

        // La caja en vivo NUNCA se filtra por fecha, es el dinero físico real de este segundo
        BigDecimal cajaEnVivo = finanzasRepo.calcularEfectivoEnCajaActual(tiendaId);

        // Protecciones contra valores nulos
        if (ventasActual == null) ventasActual = BigDecimal.ZERO;
        if (ventasAnterior == null) ventasAnterior = BigDecimal.ZERO;
        if (ticketsActual == null) ticketsActual = 0L;
        if (cajaEnVivo == null) cajaEnVivo = BigDecimal.ZERO;

        BigDecimal ticketPromedio = BigDecimal.ZERO;
        if (ticketsActual > 0) {
            ticketPromedio = ventasActual.divide(new BigDecimal(ticketsActual), 2, RoundingMode.HALF_UP);
        }

        Double porcentajeCrecimiento = calcularCrecimiento(ventasActual, ventasAnterior);

        // 2. ALERTAS (Lo que quema 🔥 - NO se filtran por fecha, son urgencias de HOY)
        List<DashboardResumenDTO.AlertaStockDTO> alertasStock = inventarioRepo.obtenerAlertasStockCritico(tiendaId).stream()
                .map(p -> DashboardResumenDTO.AlertaStockDTO.builder()
                        .producto(p.getProducto())
                        .sku(p.getSku())
                        .stockActual(p.getStockActual())
                        .stockMinimo(p.getStockMinimo())
                        .build())
                .collect(Collectors.toList());

        List<DashboardResumenDTO.AlertaTrasladoDTO> alertasTraslados = operacionesRepo.obtenerTrasladosPendientes(tiendaId).stream()
                .map(t -> DashboardResumenDTO.AlertaTrasladoDTO.builder()
                        .correlativo(t.getCorrelativo())
                        .tiendaOrigenId(t.getTiendaOrigenId())
                        .fechaEnvio(t.getFechaCreacion())
                        .build())
                .collect(Collectors.toList());

        List<DashboardResumenDTO.AlertaDeudaDTO> alertasDeudas = operacionesRepo.obtenerDeudasPendientes(tiendaId).stream()
                .map(c -> DashboardResumenDTO.AlertaDeudaDTO.builder()
                        .proveedor(c.getProveedor().getRazonSocial())
                        .comprobante(c.getNumeroComprobante())
                        .montoAdeudado(c.getSaldoPendiente())
                        .fechaEmision(c.getFechaCompra())
                        .build())
                .collect(Collectors.toList());

        List<DashboardResumenDTO.AlertaCajaDTO> alertasCaja = finanzasRepo.obtenerTurnosAbiertos(tiendaId).stream()
                .filter(t -> ChronoUnit.HOURS.between(t.getFechaApertura(), LocalDateTime.now()) > 18)
                .map(t -> DashboardResumenDTO.AlertaCajaDTO.builder()
                        .turnoId(t.getId())
                        .fechaApertura(t.getFechaApertura())
                        .mensaje("Caja abierta por más de 18 horas. ¿Olvidó cerrar turno?")
                        .build())
                .collect(Collectors.toList());

        // 3. RANKINGS Y GRÁFICOS (Responden al filtro de fechas)
        List<DashboardResumenDTO.ProductoTopDTO> topProductos = ventaRepo.obtenerTopProductos(tiendaId, inicioActual, finActual, PageRequest.of(0, 5)).stream()
                .map(p -> DashboardResumenDTO.ProductoTopDTO.builder()
                        .nombre(p.getNombre())
                        .sku(p.getSku())
                        .cantidadVendida(p.getCantidadTotal())
                        .montoTotal(p.getMontoTotal())
                        .build())
                .collect(Collectors.toList());

        List<DashboardResumenDTO.ClienteVipDTO> topClientes = operacionesRepo.obtenerTopClientes(PageRequest.of(0, 5)).stream()
                .map(c -> DashboardResumenDTO.ClienteVipDTO.builder()
                        .nombre(c.getNombre())
                        .totalComprado(c.getTotalComprado())
                        .build())
                .collect(Collectors.toList());

        // Gráfica de Demanda (Picos de Venta por Hora)
        List<DashboardResumenDTO.VentasPorHoraDTO> ventasPorHora = ventaRepo.obtenerVentasPorHora(tiendaId, inicioActual, finActual).stream()
                .map(v -> DashboardResumenDTO.VentasPorHoraDTO.builder()
                        .hora(v.getHora())
                        .total(v.getTotal())
                        .build())
                .collect(Collectors.toList());

        String mensajeDelDiaDinamico = "¡Hola equipo! Recuerden ofrecer la promoción en útiles escolares e impulsar el cuaderno Loro.";

        // 4. CONSTRUIR DTO FINAL
        // Reutilizamos los campos "Hoy" y "Ayer" del DTO para mandar la data filtrada sin romper el frontend
        return DashboardResumenDTO.builder()
                .ventasHoy(ventasActual)
                .ventasAyer(ventasAnterior)
                .porcentajeCrecimiento(porcentajeCrecimiento)
                .ticketsHoy(ticketsActual)
                .ticketPromedio(ticketPromedio)
                .cajaFisicaActual(cajaEnVivo)
                .mensajeDelDia(mensajeDelDiaDinamico)
                .alertasStock(alertasStock)
                .alertasTraslados(alertasTraslados)
                .alertasDeudas(alertasDeudas)
                .alertasCaja(alertasCaja)
                .topProductos(topProductos)
                .topClientes(topClientes)
                .ventasPorHora(ventasPorHora)
                .build();
    }

    private Double calcularCrecimiento(BigDecimal actual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) > 0) {
            return actual.subtract(anterior)
                    .divide(anterior, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .doubleValue();
        } else if (actual.compareTo(BigDecimal.ZERO) > 0) {
            return 100.0;
        }
        return 0.0;
    }
}