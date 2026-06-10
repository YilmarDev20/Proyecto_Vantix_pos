package com.vantix.pos.modules.catalog.variant.mapper;

import com.vantix.pos.modules.catalog.variant.dto.VarianteRequestDTO;
import com.vantix.pos.modules.catalog.variant.dto.VarianteResponseDTO;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VarianteMapper {
    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    @Mapping(target = "marcaNombre", source = "producto.marca") // <-- Extrae la marca
    VarianteResponseDTO toDto(Variante variante);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "costoPromedio", ignore = true)
    @Mapping(target = "producto", ignore = true)
    @Mapping(target = "presentaciones", ignore = true)
    Variante toEntity(VarianteRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "costoPromedio", ignore = true)
    @Mapping(target = "producto", ignore = true)
    @Mapping(target = "presentaciones", ignore = true)
    void updateEntityFromDto(VarianteRequestDTO requestDTO, @MappingTarget Variante variante);
}