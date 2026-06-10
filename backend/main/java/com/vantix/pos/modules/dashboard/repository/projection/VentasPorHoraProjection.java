package com.vantix.pos.modules.dashboard.repository.projection;
import java.math.BigDecimal;

public interface VentasPorHoraProjection {
    Integer getHora();
    BigDecimal getTotal();
}