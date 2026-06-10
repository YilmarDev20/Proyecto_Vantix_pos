package com.vantix.pos.modules.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TiendaRequestDTO {

    @NotBlank(message = "El nombre de la tienda es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String nombre;

    private String direccion;

    @Size(max = 20, message = "El teléfono no puede exceder los 20 caracteres")
    private String telefono;

    private String mensajeTicket;

    // ---> NUEVO GUARDIA: Permitimos que entre este dato <---
    private Boolean esPrincipal;
}