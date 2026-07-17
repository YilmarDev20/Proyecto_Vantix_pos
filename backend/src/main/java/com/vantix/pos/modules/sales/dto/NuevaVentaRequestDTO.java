package com.vantix.pos.modules.sales.dto;

import com.vantix.pos.modules.sales.enums.MetodoPagoVenta;
import com.vantix.pos.modules.sales.enums.TipoComprobante;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class NuevaVentaRequestDTO {
    private Integer tiendaId;
    private Integer usuarioId;
    private Integer clienteId;
    private Integer turnoCajaId;
    private Integer cotizacionOrigenId;

    @NotNull(message = "El tipo de comprobante es obligatorio")
    private TipoComprobante tipoComprobante;

    @NotNull(message = "El subtotal es obligatorio")
    private BigDecimal subtotal;
    private BigDecimal descuentoTotal;
    private BigDecimal impuestoTotal;

    @NotNull(message = "El total es obligatorio")
    private BigDecimal totalFinal;

    @NotNull(message = "El pago recibido es obligatorio")
    private BigDecimal pagoRecibido;
    private BigDecimal vuelto;
    private String observaciones;

    @NotEmpty(message = "La venta debe tener al menos un producto")
    @Valid
    private List<DetalleVentaReqDTO> detalles;

    @Valid
    private List<PagoVentaReqDTO> pagos;

    @Data
    public static class DetalleVentaReqDTO {
        @NotNull
        private Integer varianteId;

        // ---> NUEVO: Para saber qué empaque (Caja, Pack, etc.) seleccionó el cajero
        private Integer presentacionId;

        @NotNull
        private Integer cantidad;
        @NotNull
        private BigDecimal precioUnitario;
        private BigDecimal descuentoUnitario;
        @NotNull
        private BigDecimal subtotal;
    }

    @Data
    public static class PagoVentaReqDTO {
        @NotNull
        private MetodoPagoVenta metodoPago;
        @NotNull
        private BigDecimal montoPagado;
        private String referencia;
    }
}