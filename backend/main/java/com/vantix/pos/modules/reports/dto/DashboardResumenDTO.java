package com.vantix.pos.modules.reports.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResumenDTO {
    private BigDecimal ventasHoy;
    private BigDecimal ventasAyer;
    private Double porcentajeCrecimiento; // Ej: 15.5 (Creció) o -5.0 (Bajó)
    private Long ticketsHoy;
    private List<ProductoTopDTO> topProductos;
}