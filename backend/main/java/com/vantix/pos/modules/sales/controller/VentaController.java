package com.vantix.pos.modules.sales.controller;

import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import com.vantix.pos.modules.sales.service.AnulacionService;
import com.vantix.pos.modules.sales.service.VentaLecturaService;
import com.vantix.pos.modules.sales.service.VentaRegistroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/transactions")
@RequiredArgsConstructor
public class VentaController {

    private final VentaRegistroService ventaRegistroService;
    private final VentaLecturaService ventaLecturaService;
    private final AnulacionService anulacionService;

    @PostMapping
    public ResponseEntity<VentaResponseDTO> procesarVenta(@Valid @RequestBody NuevaVentaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaRegistroService.procesarVenta(request));
    }

    // En VentaController.java
    // ...
    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> obtenerHistorialVentas(
            @RequestParam(required = false) Integer tiendaId) { // Quitamos el defaultValue
        return ResponseEntity.ok(ventaLecturaService.obtenerHistorial(tiendaId));
    }
    // ...

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> obtenerVentaPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ventaLecturaService.obtenerVentaPorId(id));
    }

    @PostMapping("/{id}/anular")
    public ResponseEntity<Void> anularVenta(@PathVariable Integer id) {
        anulacionService.anularVenta(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VentaResponseDTO>> obtenerHistorialPorCliente(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(ventaLecturaService.obtenerHistorialPorCliente(clienteId));
    }
}