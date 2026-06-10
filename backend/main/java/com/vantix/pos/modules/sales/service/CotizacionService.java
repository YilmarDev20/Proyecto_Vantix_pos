package com.vantix.pos.modules.sales.service;

import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.dto.ValidacionCotizacionDTO;
import com.vantix.pos.modules.sales.dto.VentaResponseDTO;

public interface CotizacionService {
    ValidacionCotizacionDTO validarStockCotizacion(Integer cotizacionId, Integer tiendaId);

    // NUEVO MÉTODO
    VentaResponseDTO actualizarCotizacion(Integer id, NuevaVentaRequestDTO request);
}