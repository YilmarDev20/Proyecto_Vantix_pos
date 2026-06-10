package com.vantix.pos.modules.store.mapper;

import com.vantix.pos.modules.store.dto.TiendaRequestDTO;
import com.vantix.pos.modules.store.dto.TiendaResponseDTO;
import com.vantix.pos.modules.store.entity.Tienda;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TiendaMapper {

    // Convierte de Entidad a DTO para enviar al Frontend
    TiendaResponseDTO toDto(Tienda tienda);

    // Convierte de DTO a Entidad para guardar un nuevo registro
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    Tienda toEntity(TiendaRequestDTO requestDTO);

    // Actualiza una Entidad existente con los datos del DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    void updateEntityFromDto(TiendaRequestDTO requestDTO, @MappingTarget Tienda tienda);
}