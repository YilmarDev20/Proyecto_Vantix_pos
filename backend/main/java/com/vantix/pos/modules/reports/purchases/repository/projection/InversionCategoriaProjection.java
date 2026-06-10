package com.vantix.pos.modules.reports.purchases.repository.projection;
import java.math.BigDecimal;

public interface InversionCategoriaProjection {
    String getCategoria();
    BigDecimal getTotal();
}