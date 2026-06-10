package com.vantix.pos.modules.transfers.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class TrasladoRequestDTO {

    @NotNull(message = "La tienda de origen es obligatoria")
    private Integer tiendaOrigenId;

    @NotNull(message = "La tienda de destino es obligatoria")
    private Integer tiendaDestinoId;

    // ---> SOLUCIÓN: Quitamos el @NotNull porque el Service saca el ID del Token de seguridad
    private Integer usuarioCreadorId;

    private String notas;

    @NotEmpty(message = "El traslado debe tener al menos un producto")
    private List<DetalleTrasladoRequestDTO> detalles;
}