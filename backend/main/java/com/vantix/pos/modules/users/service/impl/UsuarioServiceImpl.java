package com.vantix.pos.modules.users.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORT DE SEGURIDAD
import com.vantix.pos.modules.store.entity.Tienda;
import com.vantix.pos.modules.store.repository.TiendaRepository;
import com.vantix.pos.modules.users.dto.UsuarioRequestDTO;
import com.vantix.pos.modules.users.dto.UsuarioResponseDTO;
import com.vantix.pos.modules.users.entity.Usuario;
import com.vantix.pos.modules.users.mapper.UsuarioMapper;
import com.vantix.pos.modules.users.repository.UsuarioRepository;
import com.vantix.pos.modules.users.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final TiendaRepository tiendaRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuarioMapper.toDto(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO requestDTO) {
        if (usuarioRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("El correo electrónico ya está registrado");
        }

        if (requestDTO.getPassword() == null || requestDTO.getPassword().trim().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria para nuevos usuarios");
        }

        Tienda tienda = tiendaRepository.findById(requestDTO.getTiendaId())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        Usuario usuario = usuarioMapper.toEntity(requestDTO);
        usuario.setTienda(tienda);
        usuario.setEstado(true);
        usuario.setPassword(passwordEncoder.encode(requestDTO.getPassword()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        UsuarioResponseDTO responseDTO = usuarioMapper.toDto(usuarioGuardado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .modulo("SEGURIDAD").accion("CREAR_USUARIO")
                .entidadId(usuarioGuardado.getId())
                .descripcion("Se creó el usuario: " + usuarioGuardado.getNombre() + " con el Rol: " + usuarioGuardado.getRol())
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioResponseDTO fotoAnterior = usuarioMapper.toDto(usuario);

        if (!usuario.getEmail().equals(requestDTO.getEmail()) &&
                usuarioRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("El correo electrónico ya está en uso por otro usuario");
        }

        Tienda tienda = tiendaRepository.findById(requestDTO.getTiendaId())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        usuarioMapper.updateEntityFromDto(requestDTO, usuario);
        usuario.setTienda(tienda);

        if (requestDTO.getPassword() != null && !requestDTO.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        UsuarioResponseDTO fotoNueva = usuarioMapper.toDto(usuarioActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .modulo("SEGURIDAD").accion("ACTUALIZAR_USUARIO")
                .entidadId(usuarioActualizado.getId())
                .descripcion("Se actualizaron los datos/rol del usuario: " + usuarioActualizado.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public UsuarioResponseDTO cambiarEstado(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioResponseDTO fotoAnterior = usuarioMapper.toDto(usuario);

        usuario.setEstado(!usuario.getEstado());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        UsuarioResponseDTO fotoNueva = usuarioMapper.toDto(usuarioActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .modulo("SEGURIDAD").accion("CAMBIO_ESTADO")
                .entidadId(usuarioActualizado.getId())
                .descripcion("Se cambió el estado a " + (usuarioActualizado.getEstado() ? "ACTIVO" : "INACTIVO") + " del usuario: " + usuarioActualizado.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }
}