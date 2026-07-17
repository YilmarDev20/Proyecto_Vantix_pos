package com.vantix.pos.modules.reports.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventarioPredictivoDTO {
    private String sku;
    private String nombreProducto;
    private Integer stockActual;
    private Long ventasUltimos30Dias;
    private Double promedioDiarioVentas;
    private Integer diasRestantesEstimados;
    private String estadoAlerta; // Ej: "CRÍTICO", "SANO", "ESTANCADO"
}