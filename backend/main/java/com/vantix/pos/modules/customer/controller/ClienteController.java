package com.vantix.pos.modules.customer.controller;

import com.vantix.pos.modules.customer.dto.ClienteRequestDTO;
import com.vantix.pos.modules.customer.dto.ClienteResponseDTO;
import com.vantix.pos.modules.customer.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(clienteService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> crear(@Valid @RequestBody ClienteRequestDTO requestDTO) {
        return new ResponseEntity<>(clienteService.crear(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody ClienteRequestDTO requestDTO) {
        return ResponseEntity.ok(clienteService.actualizar(id, requestDTO));
    }

    // ✅ REPARADO: Se estandarizó hasAuthority a 'ROLE_ADMIN' para coincidir con tu token JWT del ecosistema
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ REPARADO: Se estandarizó hasAuthority a 'ROLE_ADMIN' para que no rechace con un 400 Access Denied
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ClienteResponseDTO> cambiarEstado(@PathVariable Integer id) {
        return ResponseEntity.ok(clienteService.cambiarEstado(id));
    }
}