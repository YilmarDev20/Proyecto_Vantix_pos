package com.vantix.pos.modules.catalog.product.controller;

import com.vantix.pos.modules.catalog.product.dto.ProductoRequestDTO;
import com.vantix.pos.modules.catalog.product.dto.ProductoResponseDTO;
import com.vantix.pos.modules.catalog.product.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // Libre para todos los logueados (Cajero y Admin necesitan ver el catálogo)
    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(productoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    // ---> CORRECCIÓN: Se actualizó de 'ADMINISTRADOR' a 'ROLE_ADMIN' <---
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<ProductoResponseDTO> crear(@Valid @RequestBody ProductoRequestDTO requestDTO) {
        return new ResponseEntity<>(productoService.crear(requestDTO), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody ProductoRequestDTO requestDTO) {
        return ResponseEntity.ok(productoService.actualizar(id, requestDTO));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ProductoResponseDTO> cambiarEstado(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.cambiarEstado(id));
    }
}