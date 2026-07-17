package com.vantix.pos.modules.store.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TiendaResponseDTO {
    private Integer id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String mensajeTicket;
    private Boolean estado;
    private LocalDateTime fechaCreacion;

    // ---> NUEVO: Permitimos que el dato salga hacia React <---
    private Boolean esPrincipal;
}