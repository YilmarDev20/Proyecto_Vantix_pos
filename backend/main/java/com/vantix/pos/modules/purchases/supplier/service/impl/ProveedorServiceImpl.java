package com.vantix.pos.modules.purchases.supplier.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORT DE SEGURIDAD
import com.vantix.pos.modules.purchases.supplier.dto.ProveedorRequestDTO;
import com.vantix.pos.modules.purchases.supplier.dto.ProveedorResponseDTO;
import com.vantix.pos.modules.purchases.supplier.entity.Proveedor;
import com.vantix.pos.modules.purchases.supplier.mapper.ProveedorMapper;
import com.vantix.pos.modules.purchases.supplier.repository.ProveedorRepository;
import com.vantix.pos.modules.purchases.supplier.service.ProveedorService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final ProveedorMapper proveedorMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarActivos() {
        return proveedorRepository.findByEstadoTrueOrderByRazonSocialAsc()
                .stream().map(proveedorMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDTO obtenerPorId(Integer id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));
        return proveedorMapper.toDto(proveedor);
    }

    @Override
    @Transactional
    public ProveedorResponseDTO crear(ProveedorRequestDTO request) {
        if (proveedorRepository.existsByDocumento(request.getDocumento())) {
            throw new IllegalStateException("Ya existe un proveedor con ese RUC/DNI");
        }

        Proveedor proveedor = Proveedor.builder()
                .documento(request.getDocumento())
                .razonSocial(request.getRazonSocial())
                .nombreContacto(request.getNombreContacto())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .direccion(request.getDireccion())
                .build();

        Proveedor proveedorGuardado = proveedorRepository.save(proveedor);
        ProveedorResponseDTO responseDTO = proveedorMapper.toDto(proveedorGuardado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .modulo("PROVEEDORES").accion("CREAR")
                .entidadId(proveedorGuardado.getId())
                .descripcion("Se registró al proveedor: " + proveedorGuardado.getRazonSocial())
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public ProveedorResponseDTO actualizar(Integer id, ProveedorRequestDTO request) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));

        ProveedorResponseDTO fotoAnterior = proveedorMapper.toDto(proveedor);

        if (!proveedor.getDocumento().equals(request.getDocumento()) &&
                proveedorRepository.existsByDocumento(request.getDocumento())) {
            throw new IllegalStateException("El nuevo RUC/DNI ya está registrado en otro proveedor");
        }

        proveedor.setDocumento(request.getDocumento());
        proveedor.setRazonSocial(request.getRazonSocial());
        proveedor.setNombreContacto(request.getNombreContacto());
        proveedor.setTelefono(request.getTelefono());
        proveedor.setEmail(request.getEmail());
        proveedor.setDireccion(request.getDireccion());

        Proveedor proveedorActualizado = proveedorRepository.save(proveedor);
        ProveedorResponseDTO fotoNueva = proveedorMapper.toDto(proveedorActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .modulo("PROVEEDORES").accion("ACTUALIZAR")
                .entidadId(proveedorActualizado.getId())
                .descripcion("Se actualizaron los datos del proveedor: " + proveedorActualizado.getRazonSocial())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public void cambiarEstado(Integer id, boolean estado) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));

        ProveedorResponseDTO fotoAnterior = proveedorMapper.toDto(proveedor);

        proveedor.setEstado(estado);
        Proveedor proveedorActualizado = proveedorRepository.save(proveedor);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .modulo("PROVEEDORES").accion("CAMBIO_ESTADO")
                .entidadId(proveedorActualizado.getId())
                .descripcion("Se cambió el estado a " + (estado ? "ACTIVO" : "INACTIVO") + " del proveedor: " + proveedorActualizado.getRazonSocial())
                .valorAnterior(fotoAnterior).valorNuevo(proveedorMapper.toDto(proveedorActualizado)).direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarTodos() {
        return proveedorRepository.findAllByOrderByRazonSocialAsc()
                .stream().map(proveedorMapper::toDto).collect(Collectors.toList());
    }
}