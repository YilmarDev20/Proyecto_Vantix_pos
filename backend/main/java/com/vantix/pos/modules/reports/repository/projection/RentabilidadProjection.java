package com.vantix.pos.modules.reports.repository.projection;
import java.math.BigDecimal;

public interface RentabilidadProjection {
    BigDecimal getVentasTotales();
    BigDecimal getCostoTotal();
}