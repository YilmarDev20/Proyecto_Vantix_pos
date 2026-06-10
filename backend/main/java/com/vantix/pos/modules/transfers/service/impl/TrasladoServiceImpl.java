package com.vantix.pos.modules.transfers.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORT DE SEGURIDAD
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteInventarioDTO;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteMasivoRequestDTO;
import com.vantix.pos.modules.inventory.kardex.enums.OrigenMovimiento;
import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import com.vantix.pos.modules.inventory.kardex.service.KardexService;
import com.vantix.pos.modules.transfers.dto.DetalleTrasladoRequestDTO;
import com.vantix.pos.modules.transfers.dto.TrasladoRequestDTO;
import com.vantix.pos.modules.transfers.dto.TrasladoResponseDTO;
import com.vantix.pos.modules.transfers.entity.Traslado;
import com.vantix.pos.modules.transfers.entity.TrasladoDetalle;
import com.vantix.pos.modules.transfers.enums.EstadoTraslado;
import com.vantix.pos.modules.transfers.mapper.TrasladoMapper;
import com.vantix.pos.modules.transfers.repository.TrasladoRepository;
import com.vantix.pos.modules.transfers.service.TrasladoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrasladoServiceImpl implements TrasladoService {

    private final TrasladoRepository trasladoRepository;
    private final VarianteRepository varianteRepository;
    private final KardexService kardexService;
    private final TrasladoMapper trasladoMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public TrasladoResponseDTO crearTraslado(TrasladoRequestDTO request) {
        if (request.getTiendaOrigenId().equals(request.getTiendaDestinoId())) {
            throw new IllegalArgumentException("La tienda de origen y destino no pueden ser la misma.");
        }

        long count = trasladoRepository.count() + 1;
        String correlativo = "TR-" + String.format("%06d", count);

        // ---> DESQUEMADO: Tomamos al autor directamente del Token
        Integer usuarioRealId = SecurityUtils.getUsuarioId();

        Traslado traslado = Traslado.builder()
                .correlativo(correlativo)
                .tiendaOrigenId(request.getTiendaOrigenId())
                .tiendaDestinoId(request.getTiendaDestinoId())
                .usuarioCreadorId(usuarioRealId)
                .estadoTraslado(EstadoTraslado.PENDIENTE)
                .notas(request.getNotas())
                .build();

        List<AjusteInventarioDTO> ajustesSalida = new ArrayList<>();

        for (DetalleTrasladoRequestDTO detReq : request.getDetalles()) {
            Variante variante = varianteRepository.findById(detReq.getVarianteId())
                    .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada"));

            TrasladoDetalle detalle = TrasladoDetalle.builder()
                    .variante(variante)
                    .cantidad(detReq.getCantidad())
                    .build();
            traslado.addDetalle(detalle);

            AjusteInventarioDTO ajuste = new AjusteInventarioDTO();
            ajuste.setVarianteId(variante.getId());
            ajuste.setTipoMovimiento(TipoMovimiento.SALIDA);
            ajuste.setCantidad(detReq.getCantidad());
            ajuste.setNotas("Salida por Traslado en tránsito: " + correlativo);
            ajustesSalida.add(ajuste);
        }

        AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
        kardexRequest.setOrigen(OrigenMovimiento.TRASLADO);
        kardexRequest.setTiendaId(request.getTiendaOrigenId());
        kardexRequest.setUsuarioId(usuarioRealId);
        kardexRequest.setAjustes(ajustesSalida);

        kardexService.procesarAjusteMasivo(kardexRequest);

        Traslado trasladoGuardado = trasladoRepository.save(traslado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(usuarioRealId)
                .tiendaId(request.getTiendaOrigenId())
                .modulo("TRASLADOS")
                .accion("CREAR_ENVIO")
                .entidadId(trasladoGuardado.getId())
                .descripcion("Se envió mercadería (Correlativo: " + correlativo + ") hacia la tienda destino ID: " + request.getTiendaDestinoId())
                .valorAnterior(null)
                .valorNuevo("Estado: PENDIENTE")
                .direccionIp("127.0.0.1")
                .build());

        return trasladoMapper.toDto(trasladoGuardado);
    }

    @Override
    @Transactional
    public void aceptarTraslado(Integer trasladoId, Integer usuarioReceptorId) {
        Traslado traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado"));

        if (traslado.getEstadoTraslado() != EstadoTraslado.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden aceptar traslados en estado PENDIENTE.");
        }

        // ---> DESQUEMADO: Aseguramos que el receptor es quien hizo la petición
        Integer usuarioRealId = SecurityUtils.getUsuarioId();

        List<AjusteInventarioDTO> ajustesEntrada = new ArrayList<>();
        for (TrasladoDetalle det : traslado.getDetalles()) {
            AjusteInventarioDTO ajuste = new AjusteInventarioDTO();
            ajuste.setVarianteId(det.getVariante().getId());
            ajuste.setTipoMovimiento(TipoMovimiento.ENTRADA);
            ajuste.setCantidad(det.getCantidad());
            ajuste.setNotas("Recepción exitosa de Traslado: " + traslado.getCorrelativo());
            ajustesEntrada.add(ajuste);
        }

        AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
        kardexRequest.setOrigen(OrigenMovimiento.TRASLADO);
        kardexRequest.setTiendaId(traslado.getTiendaDestinoId());
        kardexRequest.setUsuarioId(usuarioRealId);
        kardexRequest.setAjustes(ajustesEntrada);

        kardexService.procesarAjusteMasivo(kardexRequest);

        traslado.setEstadoTraslado(EstadoTraslado.COMPLETADO);
        traslado.setUsuarioReceptorId(usuarioRealId);
        traslado.setFechaRecepcion(LocalDateTime.now());
        trasladoRepository.save(traslado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(usuarioRealId)
                .tiendaId(traslado.getTiendaDestinoId())
                .modulo("TRASLADOS")
                .accion("RECEPCIONAR")
                .entidadId(traslado.getId())
                .descripcion("Se recepcionó con éxito el traslado: " + traslado.getCorrelativo())
                .valorAnterior("Estado: PENDIENTE")
                .valorNuevo("Estado: COMPLETADO")
                .direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public void rechazarTraslado(Integer trasladoId, Integer usuarioId) {
        Traslado traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new EntityNotFoundException("Traslado no encontrado"));

        if (traslado.getEstadoTraslado() != EstadoTraslado.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden rechazar/anular traslados PENDIENTES.");
        }

        // ---> DESQUEMADO
        Integer usuarioRealId = SecurityUtils.getUsuarioId();

        List<AjusteInventarioDTO> ajustesReversion = new ArrayList<>();
        for (TrasladoDetalle det : traslado.getDetalles()) {
            AjusteInventarioDTO ajuste = new AjusteInventarioDTO();
            ajuste.setVarianteId(det.getVariante().getId());
            ajuste.setTipoMovimiento(TipoMovimiento.ENTRADA);
            ajuste.setCantidad(det.getCantidad());
            ajuste.setNotas("Reversión por Traslado Rechazado/Anulado: " + traslado.getCorrelativo());
            ajustesReversion.add(ajuste);
        }

        AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
        kardexRequest.setOrigen(OrigenMovimiento.TRASLADO);
        kardexRequest.setTiendaId(traslado.getTiendaOrigenId());
        kardexRequest.setUsuarioId(usuarioRealId);
        kardexRequest.setAjustes(ajustesReversion);

        kardexService.procesarAjusteMasivo(kardexRequest);

        traslado.setEstadoTraslado(EstadoTraslado.RECHAZADO);
        traslado.setUsuarioReceptorId(usuarioRealId);
        traslado.setFechaRecepcion(LocalDateTime.now());
        trasladoRepository.save(traslado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(usuarioRealId)
                .tiendaId(traslado.getTiendaDestinoId())
                .modulo("TRASLADOS")
                .accion("RECHAZAR")
                .entidadId(traslado.getId())
                .descripcion("Se rechazó la recepción de mercadería del traslado: " + traslado.getCorrelativo())
                .valorAnterior("Estado: PENDIENTE")
                .valorNuevo("Estado: RECHAZADO")
                .direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrasladoResponseDTO> obtenerHistorial(Integer tiendaId) {
        return trasladoRepository.findAllByTiendaRelacionada(tiendaId).stream()
                .map(trasladoMapper::toDto)
                .collect(Collectors.toList());
    }
}