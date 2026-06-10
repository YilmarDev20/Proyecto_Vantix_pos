package com.vantix.pos.modules.reports.controller;

import com.vantix.pos.modules.reports.purchases.dto.ReporteComprasDTO;
import com.vantix.pos.modules.reports.purchases.service.ReporteComprasService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/reportes/compras")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteComprasController {

    private final ReporteComprasService reporteComprasService;

    @GetMapping("/resumen")
    public ResponseEntity<ReporteComprasDTO> obtenerResumenCompras(
            @RequestParam(required = false) Integer tiendaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDateTime fechaInicio = inicio.atStartOfDay();
        LocalDateTime fechaFin = fin.atTime(LocalTime.MAX);

        return ResponseEntity.ok(reporteComprasService.generarReporteCompras(tiendaId, fechaInicio, fechaFin));
    }
}