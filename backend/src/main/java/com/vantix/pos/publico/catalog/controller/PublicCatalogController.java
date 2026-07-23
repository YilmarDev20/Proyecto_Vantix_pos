package com.vantix.pos.publico.catalog.controller;

import com.vantix.pos.publico.catalog.dto.ProductoPadreWebDTO;
import com.vantix.pos.publico.catalog.service.PublicCatalogService;
import com.vantix.pos.modules.category.dto.CategoriaResponseDTO;
import com.vantix.pos.modules.category.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/catalog")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final PublicCatalogService publicCatalogService;
    private final CategoriaService categoriaService;

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoPadreWebDTO>> obtenerCatalogoPorTienda(
            @RequestParam(required = false) Integer tiendaId) {
        List<ProductoPadreWebDTO> catalogo = publicCatalogService.obtenerCatalogoPublico(tiendaId);
        return ResponseEntity.ok(catalogo);
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<ProductoPadreWebDTO> obtenerProductoPorId(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer tiendaId) {
        ProductoPadreWebDTO producto = publicCatalogService.obtenerProductoPorId(id, tiendaId);
        return ResponseEntity.ok(producto);
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaResponseDTO>> obtenerCategoriasPublicas() {
        return ResponseEntity.ok(categoriaService.obtenerTodas());
    }
}