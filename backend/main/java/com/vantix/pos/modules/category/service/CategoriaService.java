package com.vantix.pos.modules.category.service;

import com.vantix.pos.modules.category.dto.CategoriaRequestDTO;
import com.vantix.pos.modules.category.dto.CategoriaResponseDTO;
import java.util.List;

public interface CategoriaService {
    List<CategoriaResponseDTO> obtenerTodas();
    CategoriaResponseDTO obtenerPorId(Integer id);
    CategoriaResponseDTO crear(CategoriaRequestDTO requestDTO);
    CategoriaResponseDTO actualizar(Integer id, CategoriaRequestDTO requestDTO);
    void eliminar(Integer id);
    CategoriaResponseDTO cambiarEstado(Integer id); // NUEVO: Para habilitar/deshabilitar
}