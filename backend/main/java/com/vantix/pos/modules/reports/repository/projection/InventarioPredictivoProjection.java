package com.vantix.pos.modules.reports.repository.projection;

public interface InventarioPredictivoProjection {
    String getSku();
    String getNombre();
    Integer getStockActual();
    Long getVentasPeriodo();
}