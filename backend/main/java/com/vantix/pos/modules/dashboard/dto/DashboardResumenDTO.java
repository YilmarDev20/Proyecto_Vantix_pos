package com.vantix.pos.modules.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DashboardResumenDTO {
    // 1. KPIs de la Fila Superior
    private BigDecimal ventasHoy;
    private BigDecimal ventasAyer;
    private Double porcentajeCrecimiento;
    private Long ticketsHoy;
    private BigDecimal ticketPromedio;
    private BigDecimal cajaFisicaActual; // Dinero en gaveta

    // 2. Tablón de Anuncios
    private String mensajeDelDia;

    // 3. Alertas de Acción Requerida (Lo que Quema)
    private List<AlertaStockDTO> alertasStock;
    private List<AlertaTrasladoDTO> alertasTraslados;
    private List<AlertaDeudaDTO> alertasDeudas;
    private List<AlertaCajaDTO> alertasCaja;
    private List<VentasPorHoraDTO> ventasPorHora;

    // 4. Rankings
    private List<ProductoTopDTO> topProductos;
    private List<ClienteVipDTO> topClientes;

    // --- SUB DTOs (Agrupados para limpieza) ---

    @Data @Builder
    public static class AlertaStockDTO {
        private String producto;
        private String sku;
        private Integer stockActual;
        private Integer stockMinimo;
    }

    @Data @Builder
    public static class AlertaTrasladoDTO {
        private String correlativo;
        private Integer tiendaOrigenId;
        private LocalDateTime fechaEnvio;
    }

    @Data @Builder
    public static class AlertaDeudaDTO {
        private String proveedor;
        private String comprobante;
        private BigDecimal montoAdeudado;
        private LocalDateTime fechaEmision;
    }

    @Data @Builder
    public static class AlertaCajaDTO {
        private Integer turnoId;
        private LocalDateTime fechaApertura;
        private String mensaje;
    }

    @Data @Builder
    public static class ProductoTopDTO {
        private String nombre;
        private String sku;
        private Integer cantidadVendida;
        private BigDecimal montoTotal;
    }

    @Data @Builder
    public static class ClienteVipDTO {
        private String nombre;
        private BigDecimal totalComprado;
    }

    @Data @Builder
    public static class VentasPorHoraDTO {
        private Integer hora;
        private BigDecimal total;
    }
}