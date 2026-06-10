package com.vantix.pos.modules.reports.finances.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface MovimientoCajaProjection {
    LocalDateTime getFecha();
    String getTipoMovimiento();
    String getMetodoPago();
    String getConcepto();
    BigDecimal getMonto();
}