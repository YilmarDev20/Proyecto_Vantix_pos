package com.vantix.pos.modules.settings.controller;

import com.vantix.pos.core.storage.service.FileStorageService;
import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaRequestDTO;
import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaResponseDTO;
import com.vantix.pos.modules.settings.service.ConfiguracionEmpresaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/configuracion")
@RequiredArgsConstructor
// ❌ ELIMINAMOS EL CANDADO GLOBAL DE AQUÍ
public class ConfiguracionEmpresaController {

    private final ConfiguracionEmpresaService service;
    private final FileStorageService storageService;

    // ✅ LECTURA LIBRE: El cajero y el admin pueden ver los datos para imprimir tickets
    @GetMapping
    public ResponseEntity<ConfiguracionEmpresaResponseDTO> obtener() {
        return ResponseEntity.ok(service.obtenerConfiguracion());
    }

    // 🔒 BLINDADO: Solo el Admin puede modificar los datos
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping
    public ResponseEntity<ConfiguracionEmpresaResponseDTO> actualizar(@Valid @RequestBody ConfiguracionEmpresaRequestDTO request) {
        return ResponseEntity.ok(service.actualizarConfiguracion(request));
    }

    // 🔒 BLINDADO: Solo el Admin puede cambiar el logo
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/logo")
    public ResponseEntity<ConfiguracionEmpresaResponseDTO> subirLogo(@RequestParam("file") MultipartFile file) {
        String urlPublica = storageService.guardarLogo(file);
        return ResponseEntity.ok(service.actualizarLogo(urlPublica));
    }
}