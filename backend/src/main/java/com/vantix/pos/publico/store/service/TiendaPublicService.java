package com.vantix.pos.publico.store.service;

import com.vantix.pos.modules.store.dto.TiendaResponseDTO;
import com.vantix.pos.modules.store.mapper.TiendaMapper;
import com.vantix.pos.modules.store.repository.TiendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TiendaPublicService {

    private final TiendaRepository tiendaRepository;
    private final TiendaMapper tiendaMapper;

    @Transactional(readOnly = true)
    public List<TiendaResponseDTO> listarTiendasPublicas() {
        return tiendaRepository.findAll()
                .stream()
                .filter(t -> Boolean.TRUE.equals(t.getEstado())) // 🛡️ Filtra solo las tiendas activas
                .map(tiendaMapper::toDto)
                .collect(Collectors.toList());
    }
}