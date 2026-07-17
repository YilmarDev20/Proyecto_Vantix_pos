package com.vantix.pos.modules.transfers.controller;

import com.vantix.pos.modules.transfers.dto.TrasladoRequestDTO;
import com.vantix.pos.modules.transfers.dto.TrasladoResponseDTO;
import com.vantix.pos.modules.transfers.service.TrasladoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
public class TrasladoController {

    private final TrasladoService trasladoService;

    // ---> SOLUCIÓN: El rol exacto que viaja en el Token es 'ROLE_ADMIN' <---
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<TrasladoResponseDTO> crearTraslado(@Valid @RequestBody TrasladoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trasladoService.crearTraslado(request));
    }

    // Libre: El cajero DEBE poder confirmar que recibió la mercadería
    @PatchMapping("/{id}/accept")
    public ResponseEntity<Void> aceptarTraslado(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "1") Integer usuarioId) {
        trasladoService.aceptarTraslado(id, usuarioId);
        return ResponseEntity.ok().build();
    }

    // Libre: El cajero DEBE poder rechazar si la mercadería llegó en mal estado
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Void> rechazarTraslado(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "1") Integer usuarioId) {
        trasladoService.rechazarTraslado(id, usuarioId);
        return ResponseEntity.ok().build();
    }

    // Libre: Para visualizar los traslados en camino
    @GetMapping
    public ResponseEntity<List<TrasladoResponseDTO>> obtenerHistorial(@RequestParam Integer tiendaId) {
        return ResponseEntity.ok(trasladoService.obtenerHistorial(tiendaId));
    }
}