package com.vantix.pos.modules.reports.purchases.service;

import com.vantix.pos.modules.reports.purchases.dto.ReporteComprasDTO;
import java.time.LocalDateTime;

public interface ReporteComprasService {
    /**
     * Genera un análisis completo de inversión y deudas a proveedores.
     * Soporta visión global si tiendaId es nulo.
     */
    ReporteComprasDTO generarReporteCompras(Integer tiendaId, LocalDateTime inicio, LocalDateTime fin);
}