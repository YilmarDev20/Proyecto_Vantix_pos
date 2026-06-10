package com.vantix.pos.modules.reports.inventory.repository.projection;
import java.math.BigDecimal;

public interface InventarioStockProjection {
    Integer getVarianteId();
    String getSku();
    String getNombreProducto();
    String getMarca();
    String getAtributosJson();
    BigDecimal getCosto();
    BigDecimal getPrecio();
    Integer getStockActual();
    Integer getStockMinimo(); // NUEVO
    Integer getVentasTotales();
}