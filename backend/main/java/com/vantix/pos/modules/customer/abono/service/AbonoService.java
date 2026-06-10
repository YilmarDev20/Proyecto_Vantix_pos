package com.vantix.pos.modules.customer.abono.service;

import com.vantix.pos.modules.customer.abono.dto.AbonoRequestDTO;
import com.vantix.pos.modules.customer.abono.dto.AbonoResponseDTO;

import java.util.List;

public interface AbonoService {
    AbonoResponseDTO registrarAbono(AbonoRequestDTO request);
    List<AbonoResponseDTO> obtenerHistorialPorCliente(Integer clienteId);
    void anularAbono(Integer abonoId);
}