package com.vantix.pos.modules.finances.controller;

import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.finances.dto.*;
import com.vantix.pos.modules.finances.service.TurnoCajaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finances/caja")
@RequiredArgsConstructor
public class TurnoCajaController {

    private final TurnoCajaService turnoCajaService;

    @GetMapping("/activa/{tiendaId}")
    public ResponseEntity<TurnoCajaResponseDTO> obtenerTurnoActivo(@PathVariable Integer tiendaId) {
        Integer usuarioActualId = SecurityUtils.getUsuarioId();
        TurnoCajaResponseDTO turno = turnoCajaService.obtenerTurnoActivo(tiendaId, usuarioActualId);
        return turno != null ? ResponseEntity.ok(turno) : ResponseEntity.noContent().build();
    }

    @PostMapping("/abrir")
    public ResponseEntity<TurnoCajaResponseDTO> abrirCaja(@Valid @RequestBody AperturaCajaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turnoCajaService.abrirCaja(request));
    }

    @PostMapping("/{turnoId}/movimientos")
    public ResponseEntity<Void> registrarMovimiento(@PathVariable Integer turnoId, @Valid @RequestBody NuevoMovimientoRequestDTO request) {
        turnoCajaService.registrarMovimiento(turnoId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{turnoId}/cerrar")
    public ResponseEntity<TurnoCajaResponseDTO> cerrarCaja(@PathVariable Integer turnoId, @Valid @RequestBody CierreCajaRequestDTO request) {
        return ResponseEntity.ok(turnoCajaService.cerrarCaja(turnoId, request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    // ---> CORRECCIÓN ARQUITECTÓNICA: Ya no es /historial/{id}, ahora es /historial con un query param opcional <---
    @GetMapping("/historial")
    public ResponseEntity<List<TurnoCajaResponseDTO>> obtenerHistorialTurnos(
            @RequestParam(required = false) Integer tiendaId) {
        return ResponseEntity.ok(turnoCajaService.obtenerHistorialTurnos(tiendaId));
    }

    @GetMapping("/{turnoId}/movimientos-detalle")
    public ResponseEntity<List<MovimientoCajaResponseDTO>> obtenerMovimientosPorTurno(@PathVariable Integer turnoId) {
        return ResponseEntity.ok(turnoCajaService.obtenerMovimientosPorTurno(turnoId));
    }
}