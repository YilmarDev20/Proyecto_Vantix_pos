package com.vantix.pos.modules.transfers.service;

import com.vantix.pos.modules.transfers.dto.TrasladoRequestDTO;
import com.vantix.pos.modules.transfers.dto.TrasladoResponseDTO;

import java.util.List;

public interface TrasladoService {
    TrasladoResponseDTO crearTraslado(TrasladoRequestDTO request);
    void aceptarTraslado(Integer trasladoId, Integer usuarioReceptorId);
    void rechazarTraslado(Integer trasladoId, Integer usuarioId);
    List<TrasladoResponseDTO> obtenerHistorial(Integer tiendaId);
}