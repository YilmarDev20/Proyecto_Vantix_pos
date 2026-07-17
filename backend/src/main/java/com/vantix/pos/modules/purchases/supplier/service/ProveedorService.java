package com.vantix.pos.modules.purchases.supplier.service;

import com.vantix.pos.modules.purchases.supplier.dto.ProveedorRequestDTO;
import com.vantix.pos.modules.purchases.supplier.dto.ProveedorResponseDTO;

import java.util.List;

public interface ProveedorService {
    List<ProveedorResponseDTO> listarActivos();
    ProveedorResponseDTO obtenerPorId(Integer id);
    ProveedorResponseDTO crear(ProveedorRequestDTO request);
    ProveedorResponseDTO actualizar(Integer id, ProveedorRequestDTO request);
    void cambiarEstado(Integer id, boolean estado);
    List<ProveedorResponseDTO> listarTodos();
}