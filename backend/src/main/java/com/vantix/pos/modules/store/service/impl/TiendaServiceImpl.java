package com.vantix.pos.modules.store.service.impl;

import com.vantix.pos.modules.store.dto.TiendaRequestDTO;
import com.vantix.pos.modules.store.dto.TiendaResponseDTO;
import com.vantix.pos.modules.store.entity.Tienda;
import com.vantix.pos.modules.store.mapper.TiendaMapper;
import com.vantix.pos.modules.store.repository.TiendaRepository;
import com.vantix.pos.modules.store.service.TiendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TiendaServiceImpl implements TiendaService {

    private final TiendaRepository tiendaRepository;
    private final TiendaMapper tiendaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TiendaResponseDTO> obtenerTodas() {
        return tiendaRepository.findAll()
                .stream()
                .map(tiendaMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TiendaResponseDTO obtenerPorId(Integer id) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada con el ID: " + id));
        return tiendaMapper.toDto(tienda);
    }

    @Override
    @Transactional
    public TiendaResponseDTO crear(TiendaRequestDTO requestDTO) {
        // Lógica Exclusiva: Si esta es principal, apagamos las demás
        if (Boolean.TRUE.equals(requestDTO.getEsPrincipal())) {
            removerOtrasSedesPrincipales();
        }

        Tienda tienda = tiendaMapper.toEntity(requestDTO);
        tienda.setEstado(true);

        // ---> SOLUCIÓN: FORZAMOS LA ASIGNACIÓN MANUAL AQUÍ <---
        tienda.setEsPrincipal(requestDTO.getEsPrincipal() != null ? requestDTO.getEsPrincipal() : false);

        Tienda tiendaGuardada = tiendaRepository.save(tienda);
        return tiendaMapper.toDto(tiendaGuardada);
    }

    @Override
    @Transactional
    public TiendaResponseDTO actualizar(Integer id, TiendaRequestDTO requestDTO) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada con el ID: " + id));

        // Lógica Exclusiva: Si esta es principal, apagamos las demás
        if (Boolean.TRUE.equals(requestDTO.getEsPrincipal())) {
            removerOtrasSedesPrincipales();
        }

        tiendaMapper.updateEntityFromDto(requestDTO, tienda);

        // ---> SOLUCIÓN: FORZAMOS LA ASIGNACIÓN MANUAL AQUÍ <---
        tienda.setEsPrincipal(requestDTO.getEsPrincipal() != null ? requestDTO.getEsPrincipal() : false);

        Tienda tiendaActualizada = tiendaRepository.save(tienda);
        return tiendaMapper.toDto(tiendaActualizada);
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada con el ID: " + id));
        tienda.setEstado(false);
        tiendaRepository.save(tienda);
    }

    @Override
    @Transactional
    public TiendaResponseDTO cambiarEstado(Integer id) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada con el ID: " + id));
        tienda.setEstado(!tienda.getEstado());
        Tienda tiendaActualizada = tiendaRepository.save(tienda);
        return tiendaMapper.toDto(tiendaActualizada);
    }

    // ---> MÉTODO PRIVADO DE LIMPIEZA <---
    private void removerOtrasSedesPrincipales() {
        List<Tienda> principalesAnteriores = tiendaRepository.findByEsPrincipalTrue();
        for (Tienda t : principalesAnteriores) {
            t.setEsPrincipal(false);
        }
        tiendaRepository.saveAll(principalesAnteriores);
    }
}