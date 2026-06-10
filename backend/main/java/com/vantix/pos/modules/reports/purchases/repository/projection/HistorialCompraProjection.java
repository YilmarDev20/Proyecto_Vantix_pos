package com.vantix.pos.modules.reports.purchases.repository.projection;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface HistorialCompraProjection {
    LocalDateTime getFecha();
    String getComprobante();
    String getProveedor();
    String getMetodoPago();
    String getEstado();
    BigDecimal getTotal();
}