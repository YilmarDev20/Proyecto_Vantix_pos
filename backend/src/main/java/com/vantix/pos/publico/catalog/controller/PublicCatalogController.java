package com.vantix.pos.publico.catalog.controller;

import com.vantix.pos.publico.catalog.dto.CatalogoWebResponseDTO;
import com.vantix.pos.publico.catalog.service.PublicCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/catalog")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final PublicCatalogService publicCatalogService;

    @GetMapping("/productos")
    public ResponseEntity<List<CatalogoWebResponseDTO>> obtenerCatalogoPorTienda(@RequestParam Integer tiendaId) {
        List<CatalogoWebResponseDTO> catalogo = publicCatalogService.obtenerCatalogoPublico(tiendaId);
        return ResponseEntity.ok(catalogo);
    }
}