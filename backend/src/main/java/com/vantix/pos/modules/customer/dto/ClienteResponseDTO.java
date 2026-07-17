package com.vantix.pos.modules.customer.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClienteResponseDTO {
    private Integer id;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombreCompleto;
    private String telefono;
    private String email;
    private BigDecimal totalComprado;
    private LocalDateTime ultimaCompra;
    private BigDecimal lineaCreditoMaxima;
    private BigDecimal deudaActual;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
}