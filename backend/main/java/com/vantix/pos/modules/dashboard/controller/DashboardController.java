package com.vantix.pos.modules.dashboard.controller;

import com.vantix.pos.modules.dashboard.dto.DashboardResumenDTO;
import com.vantix.pos.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResumenDTO> obtenerDashboard(
            @RequestParam(required = false) Integer tiendaId,
            @RequestParam(required = false, defaultValue = "HOY") String rango) {

        // ACTUALIZADO: Llamamos al nuevo método con el rango
        return ResponseEntity.ok(dashboardService.obtenerResumen(tiendaId, rango));
    }
}