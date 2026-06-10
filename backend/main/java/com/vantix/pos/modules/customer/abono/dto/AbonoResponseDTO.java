package com.vantix.pos.modules.customer.abono.dto;

import com.vantix.pos.modules.sales.enums.MetodoPagoVenta;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AbonoResponseDTO {
    private Integer id;
    private Integer clienteId;
    private String clienteNombre;
    private Integer turnoCajaId;
    private BigDecimal montoTotal;
    private MetodoPagoVenta metodoPago;
    private String referencia;
    private String notas;
    private Boolean estado;
    private LocalDateTime fechaAbono;
    private List<DetalleAbonoResDTO> detalles;

    @Data
    public static class DetalleAbonoResDTO {
        private Integer id;
        private Integer ventaId;
        private String correlativoVenta;
        private BigDecimal montoAsignado;
    }
}