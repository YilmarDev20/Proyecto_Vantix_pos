package com.vantix.pos.modules.reports.finances.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReporteFinanzasDTO {
    private BigDecimal fondoInicial; // ---> NUEVO CAMPO
    private BigDecimal totalIngresos;
    private BigDecimal totalEgresos;
    private BigDecimal saldoNeto;
    private List<FlujoPagoDTO> distribucionPagos;
    private List<MovimientoDetalleDTO> historialMovimientos;

    @Data
    @Builder
    public static class FlujoPagoDTO {
        private String metodoPago;
        private BigDecimal totalMonto;
        private Long cantidadOperaciones;
    }

    @Data
    @Builder
    public static class MovimientoDetalleDTO {
        private LocalDateTime fecha;
        private String tipoMovimiento;
        private String metodoPago;
        private String concepto;
        private BigDecimal monto;
    }
}