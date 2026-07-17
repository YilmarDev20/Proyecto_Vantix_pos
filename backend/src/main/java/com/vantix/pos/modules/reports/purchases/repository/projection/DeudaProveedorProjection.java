package com.vantix.pos.modules.reports.purchases.repository.projection;

import java.math.BigDecimal;

public interface DeudaProveedorProjection {
    String getProveedorNombre();
    String getDocumento();
    BigDecimal getMontoAdeudado();
}