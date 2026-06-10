package com.vantix.pos.modules.sales.service;

import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import java.util.List;

public interface VentaLecturaService {
    // ---> CAMBIO: Agregamos el parámetro tiendaId <---
    List<VentaResponseDTO> obtenerHistorial(Integer tiendaId);
    VentaResponseDTO obtenerVentaPorId(Integer id);
    List<VentaResponseDTO> obtenerHistorialPorCliente(Integer clienteId);
}