package com.vantix.pos.modules.purchases.transaction.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DetalleCompraDTO {
    @NotNull(message = "La variante es obligatoria")
    private Integer varianteId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;

    @NotNull(message = "El precio de compra unitario es obligatorio")
    @Min(value = 0, message = "El precio no puede ser negativo")
    private BigDecimal precioUnitario;
}