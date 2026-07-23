package com.vantix.pos.publico.settings.controller;

import com.vantix.pos.publico.settings.dto.ConfiguracionWebDTO;
import com.vantix.pos.publico.settings.service.ConfiguracionWebService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/configuracion-web")
@RequiredArgsConstructor
public class ConfiguracionWebAdminController {

    private final ConfiguracionWebService configuracionWebService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ConfiguracionWebDTO> obtenerConfiguracion() {
        return ResponseEntity.ok(configuracionWebService.obtenerConfiguracion());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ConfiguracionWebDTO> guardarConfiguracion(@RequestBody ConfiguracionWebDTO dto) {
        return ResponseEntity.ok(configuracionWebService.guardarOActualizarConfiguracion(dto));
    }
}