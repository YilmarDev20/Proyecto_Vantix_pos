package com.vantix.pos.modules.reports.finances.service;

import com.vantix.pos.modules.reports.finances.dto.ReporteFinanzasDTO;
import java.time.LocalDateTime;

public interface ReporteFinanzasService {
    ReporteFinanzasDTO generarReporteFinanzas(Integer tiendaId, LocalDateTime inicio, LocalDateTime fin);
}