package com.vantix.pos.modules.store.controller;

import com.vantix.pos.modules.store.dto.TiendaRequestDTO;
import com.vantix.pos.modules.store.dto.TiendaResponseDTO;
import com.vantix.pos.modules.store.service.TiendaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tiendas")
@RequiredArgsConstructor
public class TiendaController {

    private final TiendaService tiendaService;

    @GetMapping
    public ResponseEntity<List<TiendaResponseDTO>> obtenerTodas() {
        return ResponseEntity.ok(tiendaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TiendaResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(tiendaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<TiendaResponseDTO> crear(@Valid @RequestBody TiendaRequestDTO requestDTO) {
        TiendaResponseDTO nuevaTienda = tiendaService.crear(requestDTO);
        return new ResponseEntity<>(nuevaTienda, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TiendaResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody TiendaRequestDTO requestDTO) {
        return ResponseEntity.ok(tiendaService.actualizar(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        // Ejecuta el Soft Delete configurado en el Service
        tiendaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // NUEVO: Endpoint para habilitar/deshabilitar
    @PatchMapping("/{id}/estado")
    public ResponseEntity<TiendaResponseDTO> cambiarEstado(@PathVariable Integer id) {
        return ResponseEntity.ok(tiendaService.cambiarEstado(id));
    }
}