package com.vantix.pos.modules.reports.purchases.repository.projection;
import java.math.BigDecimal;

public interface InversionTiendaProjection {
    Integer getTiendaId();
    BigDecimal getTotal();
}