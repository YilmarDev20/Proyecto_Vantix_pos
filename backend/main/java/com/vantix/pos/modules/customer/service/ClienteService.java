package com.vantix.pos.modules.customer.service;

import com.vantix.pos.modules.customer.dto.ClienteRequestDTO;
import com.vantix.pos.modules.customer.dto.ClienteResponseDTO;
import java.util.List;

public interface ClienteService {
    List<ClienteResponseDTO> obtenerTodos();
    ClienteResponseDTO obtenerPorId(Integer id);
    ClienteResponseDTO crear(ClienteRequestDTO requestDTO);
    ClienteResponseDTO actualizar(Integer id, ClienteRequestDTO requestDTO);
    void eliminar(Integer id);
    ClienteResponseDTO cambiarEstado(Integer id);
}