package com.vantix.pos.modules.finances.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CierreCajaRequestDTO {
    @NotNull(message = "El monto declarado es obligatorio para el cierre ciego")
    @Min(value = 0, message = "El monto no puede ser negativo")
    private BigDecimal montoCierreDeclarado;
}