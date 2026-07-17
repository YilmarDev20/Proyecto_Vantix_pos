package com.vantix.pos.modules.purchases.transaction.controller;

import com.vantix.pos.modules.purchases.transaction.dto.CompraResponseDTO;
import com.vantix.pos.modules.purchases.transaction.dto.NuevaCompraRequestDTO;
import com.vantix.pos.modules.purchases.transaction.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchases/transactions")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping
    public ResponseEntity<CompraResponseDTO> registrarCompra(@Valid @RequestBody NuevaCompraRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(compraService.registrarCompra(request));
    }

    // ---> CAMBIO: Agregamos el RequestParam <---
    @GetMapping
    public ResponseEntity<List<CompraResponseDTO>> listarCompras(
            @RequestParam(defaultValue = "1") Integer tiendaId) {
        return ResponseEntity.ok(compraService.listarCompras(tiendaId));
    }

    // ---> CAMBIO: Agregamos el RequestParam <---
    @GetMapping("/por-pagar")
    public ResponseEntity<List<CompraResponseDTO>> listarCuentasPorPagar(
            @RequestParam(defaultValue = "1") Integer tiendaId) {
        return ResponseEntity.ok(compraService.listarCuentasPorPagar(tiendaId));
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Void> anularCompra(@PathVariable Integer id) {
        compraService.anularCompra(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pagar")
    public ResponseEntity<Void> pagarDeuda(@PathVariable Integer id) {
        compraService.pagarDeuda(id);
        return ResponseEntity.noContent().build();
    }
}