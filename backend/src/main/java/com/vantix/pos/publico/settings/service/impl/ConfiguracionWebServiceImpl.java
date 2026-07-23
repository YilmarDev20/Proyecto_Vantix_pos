package com.vantix.pos.publico.settings.service.impl;

import com.vantix.pos.publico.settings.dto.ConfiguracionWebDTO;
import com.vantix.pos.publico.settings.entity.ConfiguracionWeb;
import com.vantix.pos.publico.settings.repository.ConfiguracionWebRepository;
import com.vantix.pos.publico.settings.service.ConfiguracionWebService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ConfiguracionWebServiceImpl implements ConfiguracionWebService {

    private final ConfiguracionWebRepository configuracionWebRepository;

    @Override
    @Transactional // 🚀 CORREGIDO: Se quitó (readOnly = true) para permitir el INSERT inicial si la tabla está vacía
    public ConfiguracionWebDTO obtenerConfiguracion() {
        ConfiguracionWeb config = configuracionWebRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> configuracionWebRepository.save(ConfiguracionWeb.builder()
                        .whatsappOficial("927780621")
                        .yapeTelefono("927780621")
                        .yapeTitular("Zarely Moda & Accesorios")
                        .categoriasDestacadasIds(new ArrayList<>())
                        .bannersUrls(new ArrayList<>())
                        .build()));

        return mapearADTO(config);
    }

    @Override
    @Transactional
    public ConfiguracionWebDTO guardarOActualizarConfiguracion(ConfiguracionWebDTO dto) {
        ConfiguracionWeb config = configuracionWebRepository.findAll().stream()
                .findFirst()
                .orElse(new ConfiguracionWeb());

        config.setWhatsappOficial(dto.getWhatsappOficial());
        config.setYapeTelefono(dto.getYapeTelefono());
        config.setYapeTitular(dto.getYapeTitular());
        config.setYapeQrUrl(dto.getYapeQrUrl());

        if (dto.getCategoriasDestacadasIds() != null && dto.getCategoriasDestacadasIds().size() > 3) {
            config.setCategoriasDestacadasIds(dto.getCategoriasDestacadasIds().subList(0, 3));
        } else {
            config.setCategoriasDestacadasIds(dto.getCategoriasDestacadasIds() != null ? dto.getCategoriasDestacadasIds() : new ArrayList<>());
        }

        config.setBannersUrls(dto.getBannersUrls() != null ? dto.getBannersUrls() : new ArrayList<>());
        config.setFacebookUrl(dto.getFacebookUrl());
        config.setInstagramUrl(dto.getInstagramUrl());
        config.setTiktokUrl(dto.getTiktokUrl());

        ConfiguracionWeb guardado = configuracionWebRepository.save(config);
        return mapearADTO(guardado);
    }

    private ConfiguracionWebDTO mapearADTO(ConfiguracionWeb entity) {
        return ConfiguracionWebDTO.builder()
                .id(entity.getId())
                .whatsappOficial(entity.getWhatsappOficial())
                .yapeTelefono(entity.getYapeTelefono())
                .yapeTitular(entity.getYapeTitular())
                .yapeQrUrl(entity.getYapeQrUrl())
                .categoriasDestacadasIds(entity.getCategoriasDestacadasIds())
                .bannersUrls(entity.getBannersUrls())
                .facebookUrl(entity.getFacebookUrl())
                .instagramUrl(entity.getInstagramUrl())
                .tiktokUrl(entity.getTiktokUrl())
                .build();
    }
}