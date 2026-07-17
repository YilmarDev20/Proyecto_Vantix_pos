package com.vantix.pos.modules.inventory.kardex.controller;

import com.vantix.pos.modules.inventory.kardex.dto.AjusteMasivoRequestDTO;
import com.vantix.pos.modules.inventory.kardex.dto.KardexResponseDTO;
import com.vantix.pos.modules.inventory.kardex.service.KardexService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // ---> IMPORT DE SEGURIDAD
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kardex")
@RequiredArgsConstructor
public class KardexController {

    private final KardexService kardexService;

    // ---> BLOQUEADO TOTAL: El Cajero no debe ver historiales ni hacer ajustes manuales <---
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<KardexResponseDTO>> obtenerHistorialCompleto(
            // Le quitamos el defaultValue = "1" y le ponemos required = false
            @RequestParam(required = false) Integer tiendaId) {
        return ResponseEntity.ok(kardexService.obtenerHistorialCompleto(tiendaId));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/variante/{varianteId}")
    public ResponseEntity<List<KardexResponseDTO>> obtenerHistorialPorVariante(@PathVariable Integer varianteId) {
        return ResponseEntity.ok(kardexService.obtenerHistorialPorVariante(varianteId));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/ajuste-masivo")
    public ResponseEntity<Void> procesarAjusteMasivo(@Valid @RequestBody AjusteMasivoRequestDTO requestDTO) {
        kardexService.procesarAjusteMasivo(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}