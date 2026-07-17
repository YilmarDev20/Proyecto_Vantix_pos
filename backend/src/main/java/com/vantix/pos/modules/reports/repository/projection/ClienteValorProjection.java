package com.vantix.pos.modules.reports.repository.projection;
import java.math.BigDecimal;

public interface ClienteValorProjection {
    Integer getId();
    String getDocumento();
    String getNombre();
    BigDecimal getMonto();
}