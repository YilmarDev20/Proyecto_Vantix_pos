package com.vantix.pos.modules.reports.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductoTopDTO {
    private String nombre;
    private String sku;
    private Integer cantidadVendida;
    private BigDecimal montoTotal;
}