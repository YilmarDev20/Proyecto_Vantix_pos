package com.vantix.pos.modules.catalog.product.dto;

import com.vantix.pos.modules.catalog.product.enums.UnidadMedida;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductoResponseDTO {
    private Integer id;
    private Integer categoriaId;
    private String nombre;
    private String descripcion;
    private List<String> etiquetas;
    private UnidadMedida unidadMedida;
    private String imagenUrl;
    private String marca;
    private Boolean estado;

    // 🚀 NUEVO: Respuesta al frontend del POS ADMIN
    private Boolean publicadoEnWeb;

    private LocalDateTime fechaCreacion;
    private List<PackSurtidoDTO> packsSurtidos;
}