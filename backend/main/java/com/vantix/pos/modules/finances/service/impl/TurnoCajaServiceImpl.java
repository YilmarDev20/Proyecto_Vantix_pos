package com.vantix.pos.modules.finances.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORT DE SEGURIDAD
import com.vantix.pos.modules.finances.dto.*;
import com.vantix.pos.modules.finances.entity.MovimientoCaja;
import com.vantix.pos.modules.finances.entity.TurnoCaja;
import com.vantix.pos.modules.finances.enums.EstadoTurno;
import com.vantix.pos.modules.finances.enums.TipoMovimientoCaja;
import com.vantix.pos.modules.finances.repository.MovimientoCajaRepository;
import com.vantix.pos.modules.finances.repository.TurnoCajaRepository;
import com.vantix.pos.modules.finances.service.TurnoCajaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TurnoCajaServiceImpl implements TurnoCajaService {

    private final TurnoCajaRepository turnoCajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final ApplicationEventPublisher eventPublisher;

    private TurnoCajaResponseDTO mapToDTO(TurnoCaja turno) {
        TurnoCajaResponseDTO dto = new TurnoCajaResponseDTO();
        dto.setId(turno.getId());
        dto.setTiendaId(turno.getTiendaId());
        dto.setUsuarioId(turno.getUsuarioId());
        dto.setFechaApertura(turno.getFechaApertura());
        dto.setFechaCierre(turno.getFechaCierre());
        dto.setMontoApertura(turno.getMontoApertura());
        dto.setTotalIngresos(turno.getTotalIngresos());
        dto.setTotalEgresos(turno.getTotalEgresos());
        dto.setMontoCierreDeclarado(turno.getMontoCierreDeclarado());
        dto.setMontoCierreSistema(turno.getMontoCierreSistema());
        dto.setDiferencia(turno.getDiferencia());
        dto.setEstadoTurno(turno.getEstadoTurno());
        return dto;
    }

    private MovimientoCajaResponseDTO mapToMovimientoDTO(MovimientoCaja mov) {
        MovimientoCajaResponseDTO dto = new MovimientoCajaResponseDTO();
        dto.setId(mov.getId());
        dto.setTipoMovimiento(mov.getTipoMovimiento());
        dto.setMetodoPago(mov.getMetodoPago());
        dto.setMonto(mov.getMonto());
        dto.setConcepto(mov.getConcepto());
        dto.setFechaMovimiento(mov.getFechaMovimiento());
        dto.setUsuarioId(mov.getUsuarioId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public TurnoCajaResponseDTO obtenerTurnoActivo(Integer tiendaId, Integer usuarioId) {
        return turnoCajaRepository.findByTiendaIdAndUsuarioIdAndEstadoTurno(tiendaId, usuarioId, EstadoTurno.ABIERTO)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Override
    @Transactional
    public TurnoCajaResponseDTO abrirCaja(AperturaCajaRequestDTO request) {
        Integer tiendaId = request.getTiendaId() != null ? request.getTiendaId() : SecurityUtils.getTiendaId();
        Integer usuarioId = SecurityUtils.getUsuarioId(); // ---> DESQUEMADO (Fuerza al usuario actual)

        if (turnoCajaRepository.findByTiendaIdAndUsuarioIdAndEstadoTurno(tiendaId, usuarioId, EstadoTurno.ABIERTO).isPresent()) {
            throw new IllegalStateException("Ya tienes un turno abierto en esta tienda. Ciérralo primero.");
        }

        TurnoCaja nuevoTurno = TurnoCaja.builder()
                .tiendaId(tiendaId)
                .usuarioId(usuarioId)
                .montoApertura(request.getMontoApertura())
                .build();

        TurnoCaja turnoGuardado = turnoCajaRepository.save(nuevoTurno);
        TurnoCajaResponseDTO responseDTO = mapToDTO(turnoGuardado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(usuarioId).tiendaId(tiendaId)
                .modulo("CAJA_FINANZAS").accion("ABRIR_CAJA")
                .entidadId(turnoGuardado.getId())
                .descripcion("Se abrió el turno de caja con S/ " + request.getMontoApertura())
                .valorAnterior(null).valorNuevo(responseDTO)
                .direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public void registrarMovimiento(Integer turnoId, NuevoMovimientoRequestDTO request) {
        TurnoCaja turno = turnoCajaRepository.findById(turnoId)
                .orElseThrow(() -> new EntityNotFoundException("Turno no encontrado"));

        if (turno.getEstadoTurno() == EstadoTurno.CERRADO) {
            throw new IllegalStateException("No se pueden registrar movimientos en un turno cerrado");
        }

        MovimientoCaja movimiento = MovimientoCaja.builder()
                .turnoCaja(turno)
                .usuarioId(SecurityUtils.getUsuarioId()) // ---> DESQUEMADO
                .tipoMovimiento(request.getTipoMovimiento())
                .metodoPago(request.getMetodoPago())
                .monto(request.getMonto())
                .concepto(request.getConcepto())
                .build();

        MovimientoCaja movGuardado = movimientoCajaRepository.save(movimiento);

        if (request.getTipoMovimiento() == TipoMovimientoCaja.INGRESO) {
            turno.setTotalIngresos(turno.getTotalIngresos().add(request.getMonto()));
        } else {
            turno.setTotalEgresos(turno.getTotalEgresos().add(request.getMonto()));
        }
        turnoCajaRepository.save(turno);

        if (request.getConcepto() != null && !request.getConcepto().startsWith("Venta en")) {
            eventPublisher.publishEvent(AuditoriaEvent.builder()
                    .usuarioId(movimiento.getUsuarioId())
                    .tiendaId(turno.getTiendaId())
                    .modulo("CAJA_FINANZAS").accion("MOVIMIENTO_MANUAL")
                    .entidadId(movGuardado.getId())
                    .descripcion("Movimiento manual (" + request.getTipoMovimiento() + ") por S/ " + request.getMonto() + " - Motivo: " + request.getConcepto())
                    .valorAnterior(null).valorNuevo(mapToMovimientoDTO(movGuardado))
                    .direccionIp("127.0.0.1")
                    .build());
        }
    }

    @Override
    @Transactional
    public TurnoCajaResponseDTO cerrarCaja(Integer turnoId, CierreCajaRequestDTO request) {
        TurnoCaja turno = turnoCajaRepository.findById(turnoId)
                .orElseThrow(() -> new EntityNotFoundException("Turno no encontrado"));

        if (turno.getEstadoTurno() == EstadoTurno.CERRADO) {
            throw new IllegalStateException("El turno ya está cerrado");
        }

        BigDecimal montoSistema = turno.getMontoApertura()
                .add(turno.getTotalIngresos())
                .subtract(turno.getTotalEgresos());

        BigDecimal diferencia = request.getMontoCierreDeclarado().subtract(montoSistema);

        turno.setFechaCierre(LocalDateTime.now());
        turno.setMontoCierreSistema(montoSistema);
        turno.setMontoCierreDeclarado(request.getMontoCierreDeclarado());
        turno.setDiferencia(diferencia);
        turno.setEstadoTurno(EstadoTurno.CERRADO);

        TurnoCaja turnoCerrado = turnoCajaRepository.save(turno);
        TurnoCajaResponseDTO responseDTO = mapToDTO(turnoCerrado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(turno.getTiendaId()) // ---> DESQUEMADO
                .modulo("CAJA_FINANZAS").accion("CERRAR_CAJA")
                .entidadId(turnoCerrado.getId())
                .descripcion("Se cerró la caja. Diferencia (Faltante/Sobrante): S/ " + diferencia)
                .valorAnterior(null).valorNuevo(responseDTO)
                .direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    // ... (Tus importaciones y otros métodos se quedan exactamente iguales) ...

    @Override
    @Transactional(readOnly = true)
    public List<TurnoCajaResponseDTO> obtenerHistorialTurnos(Integer tiendaId) {
        // ---> NUEVO: Si tiendaId es null, trae todos los turnos. Si tiene valor, filtra. <---
        if (tiendaId == null) {
            return turnoCajaRepository.findAllByOrderByFechaAperturaDesc().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } else {
            return turnoCajaRepository.findAllByTiendaIdOrderByFechaAperturaDesc(tiendaId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
    }

// ... (El resto de tus métodos se queda igual) ...

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoCajaResponseDTO> obtenerMovimientosPorTurno(Integer turnoId) {
        return movimientoCajaRepository.findByTurnoCajaIdOrderByFechaMovimientoDesc(turnoId).stream()
                .map(this::mapToMovimientoDTO)
                .collect(Collectors.toList());
    }
}