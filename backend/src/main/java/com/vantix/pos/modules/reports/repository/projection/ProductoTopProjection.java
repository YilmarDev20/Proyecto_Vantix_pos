package com.vantix.pos.modules.reports.repository.projection;

import java.math.BigDecimal;

public interface ProductoTopProjection {
    String getNombre();
    String getSku();
    Integer getCantidadTotal();
    BigDecimal getMontoTotal();
}