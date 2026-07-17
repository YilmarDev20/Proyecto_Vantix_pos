package com.vantix.pos.modules.reports.inventory.service;

import com.vantix.pos.modules.reports.inventory.dto.InventarioPredictivoDTO;
import java.util.List;

public interface ReporteInventarioService {
    List<InventarioPredictivoDTO> generarReportePredictivo(Integer tiendaId, Integer diasAnalisis);
}