package com.vantix.pos.modules.category.controller;

import com.vantix.pos.modules.category.dto.CategoriaRequestDTO;
import com.vantix.pos.modules.category.dto.CategoriaResponseDTO;
import com.vantix.pos.modules.category.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // ---> IMPORT DE SEGURIDAD
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // Libre para lectura (El cajero necesita ver las categorías para filtrar en el POS)
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> obtenerTodas() {
        return ResponseEntity.ok(categoriaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(categoriaService.obtenerPorId(id));
    }

    // ---> BLOQUEADOS: Solo el Administrador administra el árbol de familias <---
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> crear(@Valid @RequestBody CategoriaRequestDTO requestDTO) {
        return new ResponseEntity<>(categoriaService.crear(requestDTO), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody CategoriaRequestDTO requestDTO) {
        return ResponseEntity.ok(categoriaService.actualizar(id, requestDTO));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<CategoriaResponseDTO> cambiarEstado(@PathVariable Integer id) {
        return ResponseEntity.ok(categoriaService.cambiarEstado(id));
    }
}