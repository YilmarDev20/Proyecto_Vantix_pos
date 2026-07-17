package com.vantix.pos.modules.customer.abono.dto;

import com.vantix.pos.modules.sales.enums.MetodoPagoVenta;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AbonoRequestDTO {
    @NotNull(message = "El cliente es obligatorio")
    private Integer clienteId;

    @NotNull(message = "El turno de caja es obligatorio")
    private Integer turnoCajaId;

    private Integer usuarioId; // Temporal hasta tener el módulo de seguridad

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    private BigDecimal montoTotal;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPagoVenta metodoPago;

    private String referencia;
    private String notas;
}