package com.vantix.pos.modules.transfers.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetalleTrasladoRequestDTO {
    @NotNull(message = "La variante es obligatoria")
    private Integer varianteId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    // 🚀 NUEVOS CAMPOS: Opcionales para cuando se manden empaques/cajas masivas
    private String presentacionNombre;
    private Integer factorConversion;
}