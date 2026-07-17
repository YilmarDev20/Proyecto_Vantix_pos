package com.vantix.pos.modules.sales.dto;

import com.vantix.pos.modules.sales.enums.EstadoPagoVenta;
import com.vantix.pos.modules.sales.enums.EstadoVenta;
import com.vantix.pos.modules.sales.enums.TipoComprobante;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaResponseDTO {
    private Integer id;
    private String correlativo;
    private String clienteNombre;
    private TipoComprobante tipoComprobante;
    private BigDecimal subtotal;
    private BigDecimal descuentoTotal;
    private BigDecimal totalFinal;
    private EstadoVenta estadoVenta;

    // ---> CAMPOS FINANCIEROS <---
    private EstadoPagoVenta estadoPago;
    private BigDecimal saldoPendiente;

    private LocalDateTime fechaVenta;

    private List<DetalleVentaResDTO> detalles;
    private List<PagoVentaResDTO> pagos;

    @Data
    public static class DetalleVentaResDTO {
        private Integer id;
        private String nombreProductoHistorico;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal descuentoUnitario;
        private BigDecimal subtotal;

        // ---> LA MAGIA: Añadimos el factor de conversión al DTO <---
        private Integer factorConversion;
    }

    @Data
    public static class PagoVentaResDTO {
        private Integer id;
        private String metodoPago;
        private BigDecimal montoPagado;
        private String referencia;
    }
}