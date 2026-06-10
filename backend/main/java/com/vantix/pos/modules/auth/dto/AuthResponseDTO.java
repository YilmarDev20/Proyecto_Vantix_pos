package com.vantix.pos.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token; // El "Carnet Digital" JWT
    private Integer usuarioId;
    private String nombre;
    private String email;
    private String rol;

    // Datos cruciales para el Contexto del Frontend
    private Integer tiendaId;
    private String tiendaNombre;
}