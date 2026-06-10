package com.vantix.pos.modules.purchases.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProveedorRequestDTO {
    @NotBlank(message = "El RUC o DNI es obligatorio")
    private String documento;

    @NotBlank(message = "La razón social es obligatoria")
    private String razonSocial;

    private String nombreContacto;
    private String telefono;
    private String email;
    private String direccion;
}