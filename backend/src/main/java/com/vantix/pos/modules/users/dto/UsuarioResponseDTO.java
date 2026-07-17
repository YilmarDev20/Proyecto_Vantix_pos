package com.vantix.pos.modules.users.dto;

import com.vantix.pos.modules.users.enums.RolUsuario;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UsuarioResponseDTO {
    private Integer id;
    private String nombre;
    private String email;
    private RolUsuario rol;
    private Integer tiendaId;
    private String tiendaNombre; // Para mostrar en la tabla de React
    private Boolean estado;
    private LocalDateTime fechaCreacion;
}