package com.vantix.pos.modules.reports.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class InventarioPredictivoDTO {
    private Integer varianteId;
    private String sku;
    private String nombreFormateado;
    private BigDecimal costo;
    private BigDecimal precio;
    private Double margenGanancia;
    private Integer stockActual;
    private Integer stockMinimo; // NUEVO
    private Boolean isBajoStockMinimo; // NUEVA BANDERA
    private Integer ventasUltimosDias;
    private Double promedioDiarioVentas;
    private Integer diasRestantesEstimados;
    private String estadoAlerta;
}