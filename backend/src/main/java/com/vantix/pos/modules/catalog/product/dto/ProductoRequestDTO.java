package com.vantix.pos.modules.catalog.product.dto;

import com.vantix.pos.modules.catalog.product.enums.UnidadMedida;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ProductoRequestDTO {
    private Integer categoriaId;
    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;
    private String descripcion;
    private List<String> etiquetas;
    private UnidadMedida unidadMedida;
    private String imagenUrl;
    private String marca;

    // 🚀 NUEVO: Control maestro desde el POS ADMIN
    private Boolean publicadoEnWeb;

    private List<PackSurtidoDTO> packsSurtidos;
}