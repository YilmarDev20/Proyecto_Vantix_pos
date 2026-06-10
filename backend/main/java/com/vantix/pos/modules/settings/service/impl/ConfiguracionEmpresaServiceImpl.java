package com.vantix.pos.modules.settings.service.impl;

import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaRequestDTO;
import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaResponseDTO;
import com.vantix.pos.modules.settings.entity.ConfiguracionEmpresa;
import com.vantix.pos.modules.settings.mapper.ConfiguracionEmpresaMapper;
import com.vantix.pos.modules.settings.repository.ConfiguracionEmpresaRepository;
import com.vantix.pos.modules.settings.service.ConfiguracionEmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracionEmpresaServiceImpl implements ConfiguracionEmpresaService {

    private final ConfiguracionEmpresaRepository repository;
    private final ConfiguracionEmpresaMapper mapper;

    // ID fijo porque siempre habrá una sola empresa en el sistema
    private static final Integer CONFIG_ID = 1;

    @Override
    @Transactional(readOnly = true)
    public ConfiguracionEmpresaResponseDTO obtenerConfiguracion() {
        ConfiguracionEmpresa config = repository.findById(CONFIG_ID)
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración inicial de la empresa. Ejecute el script SQL."));
        return mapper.toDto(config);
    }

    @Override
    @Transactional
    public ConfiguracionEmpresaResponseDTO actualizarConfiguracion(ConfiguracionEmpresaRequestDTO request) {
        ConfiguracionEmpresa config = repository.findById(CONFIG_ID)
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración inicial de la empresa."));

        mapper.updateEntityFromDto(request, config);
        ConfiguracionEmpresa configActualizada = repository.save(config);

        return mapper.toDto(configActualizada);
    }

    @Override
    @Transactional
    public ConfiguracionEmpresaResponseDTO actualizarLogo(String logoUrl) {
        ConfiguracionEmpresa config = repository.findById(CONFIG_ID)
                .orElseThrow(() -> new RuntimeException("Configuración inicial no encontrada."));
        config.setLogoUrl(logoUrl);
        return mapper.toDto(repository.save(config));
    }
}