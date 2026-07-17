package com.vantix.pos.modules.reports.controller;

import com.vantix.pos.modules.reports.dto.ReporteVentasDTO;
import com.vantix.pos.modules.reports.service.ReporteVentasService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/reportes") // Mantenemos la ruta base intacta para que React no falle
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteVentasController {

    private final ReporteVentasService reporteVentasService;

    // Endpoint exacto que ya usa tu ReporteVentasView en React
    @GetMapping("/ventas")
    public ResponseEntity<ReporteVentasDTO> obtenerReporteVentas(
            @RequestParam(required = false) Integer tiendaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDateTime fechaInicio = inicio.atStartOfDay();
        LocalDateTime fechaFin = fin.atTime(LocalTime.MAX);

        return ResponseEntity.ok(reporteVentasService.generarReporteVentas(tiendaId, fechaInicio, fechaFin));
    }
}