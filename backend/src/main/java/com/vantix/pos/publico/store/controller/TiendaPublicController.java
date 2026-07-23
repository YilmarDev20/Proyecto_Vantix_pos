package com.vantix.pos.publico.store.controller;

import com.vantix.pos.modules.store.dto.TiendaResponseDTO;
import com.vantix.pos.publico.store.service.TiendaPublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/tiendas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TiendaPublicController {

    private final TiendaPublicService tiendaPublicService;

    @GetMapping
    public ResponseEntity<List<TiendaResponseDTO>> obtenerTiendas() {
        return ResponseEntity.ok(tiendaPublicService.listarTiendasPublicas());
    }
}