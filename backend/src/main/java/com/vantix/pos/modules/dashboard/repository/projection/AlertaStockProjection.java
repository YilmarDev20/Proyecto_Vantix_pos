package com.vantix.pos.modules.dashboard.repository.projection;
public interface AlertaStockProjection {
    String getProducto();
    String getSku();
    Integer getStockActual();
    Integer getStockMinimo();
}