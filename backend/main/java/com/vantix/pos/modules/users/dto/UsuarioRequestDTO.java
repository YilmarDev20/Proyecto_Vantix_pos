package com.vantix.pos.modules.users.dto;

import com.vantix.pos.modules.users.enums.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    private String email;

    // Es opcional en la actualización, pero el Service validará si es obligatorio al crear
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private RolUsuario rol;

    @NotNull(message = "Debe asignar una tienda al usuario")
    private Integer tiendaId;
}