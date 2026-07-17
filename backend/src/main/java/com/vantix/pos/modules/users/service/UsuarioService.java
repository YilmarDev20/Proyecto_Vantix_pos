package com.vantix.pos.modules.users.service;

import com.vantix.pos.modules.users.dto.UsuarioRequestDTO;
import com.vantix.pos.modules.users.dto.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {
    List<UsuarioResponseDTO> obtenerTodos();
    UsuarioResponseDTO obtenerPorId(Integer id);
    UsuarioResponseDTO crear(UsuarioRequestDTO requestDTO);
    UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO requestDTO);
    UsuarioResponseDTO cambiarEstado(Integer id);
}