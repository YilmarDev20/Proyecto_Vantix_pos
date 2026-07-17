package com.vantix.pos.modules.catalog.variant.controller;

import com.vantix.pos.modules.catalog.variant.dto.VarianteRequestDTO;
import com.vantix.pos.modules.catalog.variant.dto.VarianteResponseDTO;
import com.vantix.pos.modules.catalog.variant.service.VarianteService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/variantes")
@RequiredArgsConstructor
public class VarianteController {

    private final VarianteService varianteService;

    @GetMapping
    public ResponseEntity<List<VarianteResponseDTO>> obtenerTodas(@RequestParam(defaultValue = "1") Integer tiendaId) {
        return ResponseEntity.ok(varianteService.obtenerTodas(tiendaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VarianteResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(varianteService.obtenerPorId(id));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<VarianteResponseDTO>> obtenerPorProducto(
            @PathVariable Integer productoId,
            @RequestParam(defaultValue = "1") Integer tiendaId) {
        return ResponseEntity.ok(varianteService.obtenerPorProducto(productoId, tiendaId));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<VarianteResponseDTO> crear(
            @Valid @RequestBody VarianteRequestDTO requestDTO,
            @RequestParam(required = false) Integer tiendaId) {
        return new ResponseEntity<>(varianteService.crear(requestDTO, tiendaId), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<VarianteResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody VarianteRequestDTO requestDTO,
            @RequestParam(required = false) Integer tiendaId) {
        return ResponseEntity.ok(varianteService.actualizar(id, requestDTO, tiendaId));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        varianteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<VarianteResponseDTO> cambiarEstado(@PathVariable Integer id) {
        return ResponseEntity.ok(varianteService.cambiarEstado(id));
    }

    @GetMapping("/exportar/pdf")
    public void exportarPdf(HttpServletResponse response, @RequestParam(defaultValue = "1") Integer tiendaId) {
        varianteService.exportarPdf(response, tiendaId);
    }

    @GetMapping("/exportar/excel")
    public void exportarExcel(HttpServletResponse response, @RequestParam(defaultValue = "1") Integer tiendaId) {
        varianteService.exportarExcel(response, tiendaId);
    }
}