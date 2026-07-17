package com.vantix.pos.modules.users.mapper;

import com.vantix.pos.modules.users.dto.UsuarioRequestDTO;
import com.vantix.pos.modules.users.dto.UsuarioResponseDTO;
import com.vantix.pos.modules.users.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "tiendaId", source = "tienda.id")
    @Mapping(target = "tiendaNombre", source = "tienda.nombre")
    UsuarioResponseDTO toDto(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "tienda", ignore = true) // Lo seteamos manualmente en el Service
    @Mapping(target = "password", ignore = true) // La encriptamos en el Service
    Usuario toEntity(UsuarioRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "tienda", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateEntityFromDto(UsuarioRequestDTO requestDTO, @MappingTarget Usuario usuario);
}