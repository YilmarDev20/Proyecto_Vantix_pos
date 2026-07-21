package com.vantix.pos.modules.inventory.kardex.dto;

import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteInventarioDTO {
    @NotNull(message = "La variante es obligatoria")
    private Integer varianteId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipoMovimiento;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima a ajustar es 1")
    private Integer cantidad;

    private String notas;

    // 🚀 NUEVOS CAMPOS: Para capturar el empaque visual usado desde la tabla del modal
    private String presentacionNombre;
    private Integer factorConversion;
}