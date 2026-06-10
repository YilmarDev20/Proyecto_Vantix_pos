package com.vantix.pos.modules.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaRequestDTO {
    private Integer categoriaPadreId;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El código prefijo es obligatorio")
    @Size(max = 5)
    private String codigoPrefijo;

    private String imagenUrl;
}