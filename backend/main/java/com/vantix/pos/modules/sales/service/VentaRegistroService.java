package com.vantix.pos.modules.sales.service;

import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.dto.VentaResponseDTO;

public interface VentaRegistroService {
    VentaResponseDTO procesarVenta(NuevaVentaRequestDTO request);
}