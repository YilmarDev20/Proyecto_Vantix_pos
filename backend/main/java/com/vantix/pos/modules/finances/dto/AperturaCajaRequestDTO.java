package com.vantix.pos.modules.finances.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AperturaCajaRequestDTO {
    @NotNull(message = "El monto de apertura es obligatorio")
    @Min(value = 0, message = "El monto no puede ser negativo")
    private BigDecimal montoApertura;
    private Integer tiendaId;
    private Integer usuarioId;
}