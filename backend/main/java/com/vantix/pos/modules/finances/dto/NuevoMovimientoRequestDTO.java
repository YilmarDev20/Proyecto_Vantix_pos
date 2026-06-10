package com.vantix.pos.modules.finances.dto;

import com.vantix.pos.modules.finances.enums.MetodoPago;
import com.vantix.pos.modules.finances.enums.TipoMovimientoCaja;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class NuevoMovimientoRequestDTO {
    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimientoCaja tipoMovimiento;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPago metodoPago;

    @NotNull(message = "El monto es obligatorio")
    @Min(value = 0, message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotBlank(message = "El concepto es obligatorio")
    private String concepto;

    private Integer usuarioId;
}