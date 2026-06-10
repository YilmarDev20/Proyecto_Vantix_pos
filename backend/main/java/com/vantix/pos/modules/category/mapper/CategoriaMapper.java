package com.vantix.pos.modules.category.mapper;

import com.vantix.pos.modules.category.dto.CategoriaRequestDTO;
import com.vantix.pos.modules.category.dto.CategoriaResponseDTO;
import com.vantix.pos.modules.category.entity.Categoria;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    @Mapping(target = "categoriaPadreId", source = "categoriaPadre.id")
    CategoriaResponseDTO toDto(Categoria categoria);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "categoriaPadre", ignore = true) // Se maneja en el Service
    Categoria toEntity(CategoriaRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "categoriaPadre", ignore = true)
    void updateEntityFromDto(CategoriaRequestDTO requestDTO, @MappingTarget Categoria categoria);
}