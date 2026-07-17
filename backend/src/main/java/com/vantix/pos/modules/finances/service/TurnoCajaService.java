package com.vantix.pos.modules.finances.service;

import com.vantix.pos.modules.finances.dto.AperturaCajaRequestDTO;
import com.vantix.pos.modules.finances.dto.CierreCajaRequestDTO;
import com.vantix.pos.modules.finances.dto.NuevoMovimientoRequestDTO;
import com.vantix.pos.modules.finances.dto.TurnoCajaResponseDTO;
import com.vantix.pos.modules.finances.dto.MovimientoCajaResponseDTO;

import java.util.List;

public interface TurnoCajaService {
    TurnoCajaResponseDTO obtenerTurnoActivo(Integer tiendaId, Integer usuarioId);
    TurnoCajaResponseDTO abrirCaja(AperturaCajaRequestDTO request);
    TurnoCajaResponseDTO cerrarCaja(Integer turnoId, CierreCajaRequestDTO request);
    void registrarMovimiento(Integer turnoId, NuevoMovimientoRequestDTO request);

    // ---> CAMBIO: Permitimos que reciba nulo <---
    List<TurnoCajaResponseDTO> obtenerHistorialTurnos(Integer tiendaId);
    List<MovimientoCajaResponseDTO> obtenerMovimientosPorTurno(Integer turnoId);
}