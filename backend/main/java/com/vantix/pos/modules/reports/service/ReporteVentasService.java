package com.vantix.pos.modules.reports.service;

import com.vantix.pos.modules.reports.dto.ReporteVentasDTO;
import java.time.LocalDateTime;

public interface ReporteVentasService {
    ReporteVentasDTO generarReporteVentas(Integer tiendaId, LocalDateTime inicio, LocalDateTime fin);
}