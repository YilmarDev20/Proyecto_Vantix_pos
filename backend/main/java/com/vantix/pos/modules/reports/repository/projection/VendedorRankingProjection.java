package com.vantix.pos.modules.reports.repository.projection;
import java.math.BigDecimal;

public interface VendedorRankingProjection {
    String getNombre();
    BigDecimal getTotalVendido();
    Long getCantidadOperaciones();
}