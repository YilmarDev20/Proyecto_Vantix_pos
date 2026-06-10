package com.vantix.pos.modules.auth.controller;

import com.vantix.pos.modules.auth.dto.AuthRequestDTO;
import com.vantix.pos.modules.auth.dto.AuthResponseDTO;
import com.vantix.pos.modules.auth.dto.PinRequestDTO;
import com.vantix.pos.modules.auth.dto.PinResponseDTO;
import com.vantix.pos.modules.auth.security.PinDinamicoUtil;
import com.vantix.pos.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // ---> IMPORT DE SEGURIDAD
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Libre: Endpoint público para iniciar sesión
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ---> BLOQUEADO: Solo el Administrador puede ver cuál es el PIN dinámico actual <---
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/admin-pin")
    public ResponseEntity<PinResponseDTO> obtenerPinAdmin() {
        PinResponseDTO response = PinResponseDTO.builder()
                .pinActual(PinDinamicoUtil.generarPinActual())
                .segundosRestantes(PinDinamicoUtil.obtenerSegundosRestantes())
                .build();
        return ResponseEntity.ok(response);
    }

    // Libre (pero logueado): El cajero (ROLE_SELLER) necesita este endpoint para mandar el PIN a revisión
    @PostMapping("/verificar-pin")
    public ResponseEntity<Boolean> verificarPinAutorizacion(@Valid @RequestBody PinRequestDTO request) {
        boolean esValido = PinDinamicoUtil.validarPin(request.getPin());

        if (esValido) {
            return ResponseEntity.ok(true);
        } else {
            // Si el PIN es incorrecto o ya expiró, le devolvemos un error 401
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
    }
}