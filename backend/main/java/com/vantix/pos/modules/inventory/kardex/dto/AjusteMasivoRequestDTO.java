package com.vantix.pos.modules.inventory.kardex.dto;

import com.vantix.pos.modules.inventory.kardex.enums.OrigenMovimiento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AjusteMasivoRequestDTO {
    private Integer tiendaId; // Opcional por ahora
    private Integer usuarioId; // Opcional por ahora

    @NotNull(message = "El origen es obligatorio")
    private OrigenMovimiento origen;

    @NotEmpty(message = "Debe enviar al menos un producto para ajustar")
    @Valid
    private List<AjusteInventarioDTO> ajustes;
}