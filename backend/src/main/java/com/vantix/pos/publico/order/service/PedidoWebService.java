package com.vantix.pos.publico.order.service;

import com.vantix.pos.publico.order.dto.CrearPedidoWebDTO;
import com.vantix.pos.publico.order.dto.PedidoWebResponseDTO;
import com.vantix.pos.publico.order.model.PedidoWeb;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PedidoWebService {

    // --- Métodos Públicos (Página Web) ---
    PedidoWebResponseDTO crearPedido(CrearPedidoWebDTO dto, MultipartFile comprobante);
    PedidoWebResponseDTO obtenerPorCodigo(String codigoPedido);

    // --- Métodos Administrativos (Vantix POS) ---
    List<PedidoWebResponseDTO> listarPedidosAdmin(Integer tiendaId, PedidoWeb.EstadoPedidoWeb estado);
    PedidoWebResponseDTO obtenerPorId(Long id);
    PedidoWebResponseDTO aprobarPedido(Long id);
    PedidoWebResponseDTO cancelarPedido(Long id, String motivo);
}