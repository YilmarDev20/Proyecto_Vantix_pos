package com.vantix.pos.modules.inventory.kardex.service;

import com.vantix.pos.modules.inventory.kardex.dto.AjusteMasivoRequestDTO;
import com.vantix.pos.modules.inventory.kardex.dto.KardexResponseDTO;

import java.util.List;

public interface KardexService {
    // ---> CAMBIO: Agregamos el parámetro tiendaId <---
    List<KardexResponseDTO> obtenerHistorialCompleto(Integer tiendaId);
    List<KardexResponseDTO> obtenerHistorialPorVariante(Integer varianteId);
    void procesarAjusteMasivo(AjusteMasivoRequestDTO requestDTO);
}