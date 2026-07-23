package com.vantix.pos.publico.settings.controller;

import com.vantix.pos.publico.settings.dto.ConfiguracionWebDTO;
import com.vantix.pos.publico.settings.service.ConfiguracionWebService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/configuracion-web")
@RequiredArgsConstructor
public class ConfiguracionWebPublicController {

    private final ConfiguracionWebService configuracionWebService;

    @GetMapping
    public ResponseEntity<ConfiguracionWebDTO> obtenerConfiguracionPublica() {
        return ResponseEntity.ok(configuracionWebService.obtenerConfiguracion());
    }
}