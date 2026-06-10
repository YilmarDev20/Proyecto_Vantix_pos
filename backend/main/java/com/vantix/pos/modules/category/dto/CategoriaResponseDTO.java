package com.vantix.pos.modules.category.dto;

import lombok.Data;

@Data
public class CategoriaResponseDTO {
    private Integer id;
    private Integer categoriaPadreId;
    private String nombre;
    private String codigoPrefijo;
    private String imagenUrl;
    private Boolean estado;
}