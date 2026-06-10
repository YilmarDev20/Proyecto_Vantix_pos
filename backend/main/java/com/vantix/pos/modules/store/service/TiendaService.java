package com.vantix.pos.modules.store.service;

import com.vantix.pos.modules.store.dto.TiendaRequestDTO;
import com.vantix.pos.modules.store.dto.TiendaResponseDTO;

import java.util.List;

public interface TiendaService {
    List<TiendaResponseDTO> obtenerTodas();
    TiendaResponseDTO obtenerPorId(Integer id);
    TiendaResponseDTO crear(TiendaRequestDTO requestDTO);
    TiendaResponseDTO actualizar(Integer id, TiendaRequestDTO requestDTO);
    void eliminar(Integer id); // Aquí aplicaremos el Soft Delete
    TiendaResponseDTO cambiarEstado(Integer id); // NUEVO: Para habilitar/deshabilitar
}