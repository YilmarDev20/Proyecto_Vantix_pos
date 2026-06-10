package com.vantix.pos.modules.purchases.supplier.dto;

import lombok.Data;

@Data
public class ProveedorResponseDTO {
    private Integer id;
    private String documento;
    private String razonSocial;
    private String nombreContacto;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean estado;
}