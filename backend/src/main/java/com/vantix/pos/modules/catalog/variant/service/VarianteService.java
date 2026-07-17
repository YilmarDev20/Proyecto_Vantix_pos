package com.vantix.pos.modules.catalog.variant.service;

import com.vantix.pos.modules.catalog.variant.dto.VarianteRequestDTO;
import com.vantix.pos.modules.catalog.variant.dto.VarianteResponseDTO;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

public interface VarianteService {
    List<VarianteResponseDTO> obtenerTodas(Integer tiendaId);
    VarianteResponseDTO obtenerPorId(Integer id);
    List<VarianteResponseDTO> obtenerPorProducto(Integer productoId, Integer tiendaId);
    VarianteResponseDTO crear(VarianteRequestDTO requestDTO, Integer tiendaId);
    VarianteResponseDTO actualizar(Integer id, VarianteRequestDTO requestDTO, Integer tiendaId);
    void eliminar(Integer id);
    VarianteResponseDTO cambiarEstado(Integer id);
    void exportarPdf(HttpServletResponse response, Integer tiendaId);
    void exportarExcel(HttpServletResponse response, Integer tiendaId);
}