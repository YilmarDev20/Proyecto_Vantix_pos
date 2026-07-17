package com.vantix.pos.modules.sales.controller;

import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.dto.ValidacionCotizacionDTO;
import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import com.vantix.pos.modules.sales.service.CotizacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/quotes")
@RequiredArgsConstructor
public class CotizacionController {

    private final CotizacionService cotizacionService;

    // GET: Validar stock antes de cobrar o editar
    @GetMapping("/{id}/validate")
    public ResponseEntity<ValidacionCotizacionDTO> validarCotizacionParaCobro(
            @PathVariable Integer id,
            @RequestParam Integer tiendaId) {
        return ResponseEntity.ok(cotizacionService.validarStockCotizacion(id, tiendaId));
    }

    // NUEVO - PUT: Guardar cambios de una cotización
    @PutMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> actualizarCotizacion(
            @PathVariable Integer id,
            @RequestBody NuevaVentaRequestDTO request) {
        return ResponseEntity.ok(cotizacionService.actualizarCotizacion(id, request));
    }
}