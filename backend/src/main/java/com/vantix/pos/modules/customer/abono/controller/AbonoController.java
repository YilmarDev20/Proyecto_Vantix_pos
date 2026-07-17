package com.vantix.pos.modules.customer.abono.controller;

import com.vantix.pos.modules.customer.abono.dto.AbonoRequestDTO;
import com.vantix.pos.modules.customer.abono.dto.AbonoResponseDTO;
import com.vantix.pos.modules.customer.abono.service.AbonoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/abonos")
@RequiredArgsConstructor
public class AbonoController {

    private final AbonoService abonoService;

    // Libre: El cajero DEBE poder cobrar dinero de una deuda
    @PostMapping
    public ResponseEntity<AbonoResponseDTO> registrarAbono(@Valid @RequestBody AbonoRequestDTO request) {
        return new ResponseEntity<>(abonoService.registrarAbono(request), HttpStatus.CREATED);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<AbonoResponseDTO>> obtenerPorCliente(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(abonoService.obtenerHistorialPorCliente(clienteId));
    }

    // ---> CORRECCIÓN AQUÍ: Ahora coincide exactamente con tu JWT (ROLE_ADMIN) <---
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}/anular")
    public ResponseEntity<Void> anularAbono(@PathVariable Integer id) {
        abonoService.anularAbono(id);
        return ResponseEntity.noContent().build();
    }
}