package com.vantix.pos.modules.reports.finances.repository.projection;

import java.math.BigDecimal;

public interface FlujoPagoProjection {
    String getMetodoPago();
    BigDecimal getTotalMonto();
    Long getCantidadOperaciones();
}