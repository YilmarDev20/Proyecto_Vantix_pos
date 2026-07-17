package com.vantix.pos.modules.customer.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.customer.dto.ClienteRequestDTO;
import com.vantix.pos.modules.customer.dto.ClienteResponseDTO;
import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.customer.mapper.ClienteMapper;
import com.vantix.pos.modules.customer.repository.ClienteRepository;
import com.vantix.pos.modules.customer.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> obtenerTodos() {
        return clienteRepository.findAll()
                .stream()
                .map(clienteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO obtenerPorId(Integer id) {
        // ✅ MEJORA DE PERSISTENCIA: Cambiado a findById para soportar lecturas de clientes inactivos históricos sin lanzar excepciones muertas
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return clienteMapper.toDto(cliente);
    }

    @Override
    @Transactional
    public ClienteResponseDTO crear(ClienteRequestDTO requestDTO) {
        if (requestDTO.getNumeroDocumento() != null && !requestDTO.getNumeroDocumento().trim().isEmpty()) {
            if(clienteRepository.existsByNumeroDocumentoAndEstadoTrue(requestDTO.getNumeroDocumento())) {
                throw new RuntimeException("Ya existe un cliente con este documento");
            }
        }

        Cliente cliente = clienteMapper.toEntity(requestDTO);
        cliente.setEstado(true);
        if (cliente.getLineaCreditoMaxima() == null) cliente.setLineaCreditoMaxima(BigDecimal.ZERO);
        cliente.setTotalComprado(BigDecimal.ZERO);
        cliente.setDeudaActual(BigDecimal.ZERO);

        Cliente clienteGuardado = clienteRepository.save(cliente);
        ClienteResponseDTO responseDTO = clienteMapper.toDto(clienteGuardado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CLIENTES").accion("CREAR")
                .entidadId(clienteGuardado.getId())
                .descripcion("Se registró al cliente: " + clienteGuardado.getNombreCompleto())
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public ClienteResponseDTO actualizar(Integer id, ClienteRequestDTO requestDTO) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        ClienteResponseDTO fotoAnterior = clienteMapper.toDto(cliente);

        if (requestDTO.getNumeroDocumento() != null && !requestDTO.getNumeroDocumento().trim().isEmpty()) {
            if(!requestDTO.getNumeroDocumento().equals(cliente.getNumeroDocumento()) &&
                    clienteRepository.existsByNumeroDocumentoAndEstadoTrue(requestDTO.getNumeroDocumento())) {
                throw new RuntimeException("Ya existe OTRO cliente con este documento");
            }
        }

        clienteMapper.updateEntityFromDto(requestDTO, cliente);
        Cliente clienteActualizado = clienteRepository.save(cliente);
        ClienteResponseDTO fotoNueva = clienteMapper.toDto(clienteActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CLIENTES").accion("ACTUALIZAR")
                .entidadId(clienteActualizado.getId())
                .descripcion("Se actualizaron los datos del cliente: " + clienteActualizado.getNombreCompleto())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (cliente.getDeudaActual().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("No se puede eliminar un cliente con deuda activa (Deuda: S/ " + cliente.getDeudaActual() + ").");
        }

        ClienteResponseDTO fotoAnterior = clienteMapper.toDto(cliente);

        cliente.setEstado(false);
        Cliente clienteEliminado = clienteRepository.save(cliente);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CLIENTES").accion("ELIMINAR")
                .entidadId(clienteEliminado.getId())
                .descripcion("Se eliminó (desactivó) al cliente: " + clienteEliminado.getNombreCompleto())
                .valorAnterior(fotoAnterior).valorNuevo(clienteMapper.toDto(clienteEliminado)).direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public ClienteResponseDTO cambiarEstado(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (cliente.getEstado() && cliente.getDeudaActual().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("No se puede desactivar un cliente con deuda activa (Deuda: S/ " + cliente.getDeudaActual() + "). Cobre la deuda primero.");
        }

        ClienteResponseDTO fotoAnterior = clienteMapper.toDto(cliente);

        cliente.setEstado(!cliente.getEstado());
        Cliente clienteActualizado = clienteRepository.save(cliente);
        ClienteResponseDTO fotoNueva = clienteMapper.toDto(clienteActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CLIENTES").accion("CAMBIO_ESTADO")
                .entidadId(clienteActualizado.getId())
                .descripcion("Se cambió el estado a " + (clienteActualizado.getEstado() ? "ACTIVO" : "INACTIVO") + " del cliente: " + clienteActualizado.getNombreCompleto())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }
}