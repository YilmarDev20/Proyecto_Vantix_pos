package com.vantix.pos.modules.catalog.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PackSurtidoDTO {
    private Integer id; // Puede ser null si es creación

    @NotBlank(message = "El nombre del pack es obligatorio")
    private String nombre;

    @NotNull(message = "La cantidad requerida es obligatoria")
    @Min(value = 2, message = "Un pack debe tener al menos 2 unidades")
    private Integer cantidadRequerida;

    @NotNull(message = "El precio del pack es obligatorio")
    @Min(value = 0, message = "El precio no puede ser negativo")
    private BigDecimal precioPack;
}