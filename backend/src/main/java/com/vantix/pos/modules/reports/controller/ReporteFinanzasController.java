package com.vantix.pos.modules.reports.controller;

import com.vantix.pos.modules.reports.finances.dto.ReporteFinanzasDTO;
import com.vantix.pos.modules.reports.finances.service.ReporteFinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/reportes/finanzas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteFinanzasController {

    private final ReporteFinanzasService reporteFinanzasService;

    @GetMapping("/resumen")
    public ResponseEntity<ReporteFinanzasDTO> obtenerResumenFinanciero(
            @RequestParam(required = false) Integer tiendaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDateTime fechaInicio = inicio.atStartOfDay();
        LocalDateTime fechaFin = fin.atTime(LocalTime.MAX);

        return ResponseEntity.ok(reporteFinanzasService.generarReporteFinanzas(tiendaId, fechaInicio, fechaFin));
    }
}