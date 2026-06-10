package com.vantix.pos.modules.purchases.transaction.service;

import com.vantix.pos.modules.purchases.transaction.dto.CompraResponseDTO;
import com.vantix.pos.modules.purchases.transaction.dto.NuevaCompraRequestDTO;

import java.util.List;

public interface CompraService {
    CompraResponseDTO registrarCompra(NuevaCompraRequestDTO request);
    // ---> CAMBIO: Agregamos el parámetro tiendaId <---
    List<CompraResponseDTO> listarCompras(Integer tiendaId);
    List<CompraResponseDTO> listarCuentasPorPagar(Integer tiendaId);
    void anularCompra(Integer id);
    void pagarDeuda(Integer id);
}