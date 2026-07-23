package com.vantix.pos.publico.order.controller;

import com.vantix.pos.publico.order.dto.PedidoWebResponseDTO;
import com.vantix.pos.publico.order.model.PedidoWeb;
import com.vantix.pos.publico.order.service.PedidoWebService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/pedidos-web")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class PedidoWebAdminController {

    private final PedidoWebService pedidoWebService;

    @GetMapping
    public ResponseEntity<List<PedidoWebResponseDTO>> listarPedidos(
            @RequestParam(required = false) Integer tiendaId,
            @RequestParam(required = false) PedidoWeb.EstadoPedidoWeb estado) {
        return ResponseEntity.ok(pedidoWebService.listarPedidosAdmin(tiendaId, estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoWebResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoWebService.obtenerPorId(id));
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<PedidoWebResponseDTO> aprobarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoWebService.aprobarPedido(id));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<PedidoWebResponseDTO> cancelarPedido(
            @PathVariable Long id,
            @RequestBody(required = false) String motivo) {
        return ResponseEntity.ok(pedidoWebService.cancelarPedido(id, motivo));
    }
}