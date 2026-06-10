package com.vantix.pos.modules.dashboard.service;

import com.vantix.pos.modules.dashboard.dto.DashboardResumenDTO;

public interface DashboardService {
    // ACTUALIZADO: Cambiamos el nombre y agregamos el parámetro "rango"
    DashboardResumenDTO obtenerResumen(Integer tiendaId, String rango);
}