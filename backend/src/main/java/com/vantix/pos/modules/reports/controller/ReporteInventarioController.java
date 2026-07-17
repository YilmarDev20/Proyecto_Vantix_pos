package com.vantix.pos.modules.reports.controller;

import com.vantix.pos.modules.reports.inventory.dto.InventarioPredictivoDTO;
import com.vantix.pos.modules.reports.inventory.service.ReporteInventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes/inventario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteInventarioController {

    private final ReporteInventarioService reporteInventarioService;

    // Nuevo endpoint para las predicciones de stock
    @GetMapping("/predictivo")
    public ResponseEntity<List<InventarioPredictivoDTO>> obtenerInventarioPredictivo(
            @RequestParam(required = false) Integer tiendaId,
            @RequestParam(defaultValue = "30") Integer diasAnalisis) {

        return ResponseEntity.ok(reporteInventarioService.generarReportePredictivo(tiendaId, diasAnalisis));
    }
}