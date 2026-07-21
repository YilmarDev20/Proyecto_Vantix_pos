package com.vantix.pos.modules.transfers.dto;

import lombok.Data;
import java.util.Map;

@Data
public class DetalleTrasladoResponseDTO {
    private Integer id;
    private Integer varianteId;
    private String sku;
    private String nombreProducto;
    private String marcaProducto;
    private Map<String, Object> atributos;
    private Integer cantidad;

    // 🚀 NUEVOS CAMPOS: Permiten al Modal renderizar el nombre de empaque en el historial
    private String presentacionNombre;
    private Integer factorConversion;
}