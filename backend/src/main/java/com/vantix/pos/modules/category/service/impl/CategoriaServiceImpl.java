package com.vantix.pos.modules.category.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.category.dto.CategoriaRequestDTO;
import com.vantix.pos.modules.category.dto.CategoriaResponseDTO;
import com.vantix.pos.modules.category.entity.Categoria;
import com.vantix.pos.modules.category.mapper.CategoriaMapper;
import com.vantix.pos.modules.category.repository.CategoriaRepository;
import com.vantix.pos.modules.category.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> obtenerTodas() {
        return categoriaRepository.findAll().stream()
                .filter(cat -> Boolean.TRUE.equals(cat.getEstado()))
                .map(categoriaMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponseDTO obtenerPorId(Integer id) {
        Categoria cat = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        return categoriaMapper.toDto(cat);
    }

    @Override
    @Transactional
    public CategoriaResponseDTO crear(CategoriaRequestDTO requestDTO) {
        Categoria categoria = categoriaMapper.toEntity(requestDTO);
        categoria.setEstado(true);
        asignarPadre(categoria, requestDTO.getCategoriaPadreId());

        Categoria categoriaGuardada = categoriaRepository.save(categoria);
        CategoriaResponseDTO responseDTO = categoriaMapper.toDto(categoriaGuardada);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_CATEGORIA").accion("CREAR")
                .entidadId(categoriaGuardada.getId())
                .descripcion("Se creó la categoría: " + categoriaGuardada.getNombre())
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public CategoriaResponseDTO actualizar(Integer id, CategoriaRequestDTO requestDTO) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        CategoriaResponseDTO fotoAnterior = categoriaMapper.toDto(categoria);

        categoriaMapper.updateEntityFromDto(requestDTO, categoria);
        asignarPadre(categoria, requestDTO.getCategoriaPadreId());

        Categoria categoriaActualizada = categoriaRepository.save(categoria);
        CategoriaResponseDTO fotoNueva = categoriaMapper.toDto(categoriaActualizada);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_CATEGORIA").accion("ACTUALIZAR")
                .entidadId(categoriaActualizada.getId())
                .descripcion("Se actualizó la categoría: " + categoriaActualizada.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        CategoriaResponseDTO fotoAnterior = categoriaMapper.toDto(categoria);

        categoria.setEstado(false);
        Categoria categoriaEliminada = categoriaRepository.save(categoria);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_CATEGORIA").accion("ELIMINAR")
                .entidadId(categoriaEliminada.getId())
                .descripcion("Se eliminó (desactivó) la categoría: " + categoriaEliminada.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(categoriaMapper.toDto(categoriaEliminada)).direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public CategoriaResponseDTO cambiarEstado(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        CategoriaResponseDTO fotoAnterior = categoriaMapper.toDto(categoria);

        categoria.setEstado(!categoria.getEstado());
        Categoria categoriaActualizada = categoriaRepository.save(categoria);
        CategoriaResponseDTO fotoNueva = categoriaMapper.toDto(categoriaActualizada);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_CATEGORIA").accion("CAMBIO_ESTADO")
                .entidadId(categoriaActualizada.getId())
                .descripcion("Se cambió el estado a " + (categoriaActualizada.getEstado() ? "ACTIVO" : "INACTIVO") + " de la categoría: " + categoriaActualizada.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    private void asignarPadre(Categoria categoria, Integer padreId) {
        if (padreId != null) {
            Categoria padre = categoriaRepository.findById(padreId)
                    .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada"));
            categoria.setCategoriaPadre(padre);
        } else {
            categoria.setCategoriaPadre(null);
        }
    }
}