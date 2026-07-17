package com.vantix.pos.modules.settings.mapper;

import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaRequestDTO;
import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaResponseDTO;
import com.vantix.pos.modules.settings.entity.ConfiguracionEmpresa;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ConfiguracionEmpresaMapper {

    ConfiguracionEmpresaResponseDTO toDto(ConfiguracionEmpresa configuracion);

    // Solo necesitamos actualizar, la entidad ya existe (ID 1)
    void updateEntityFromDto(ConfiguracionEmpresaRequestDTO dto, @MappingTarget ConfiguracionEmpresa configuracion);
}