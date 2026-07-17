package com.vantix.pos.modules.customer.mapper;

import com.vantix.pos.modules.customer.dto.ClienteRequestDTO;
import com.vantix.pos.modules.customer.dto.ClienteResponseDTO;
import com.vantix.pos.modules.customer.entity.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClienteMapper {
    ClienteResponseDTO toDto(Cliente cliente);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalComprado", ignore = true)
    @Mapping(target = "ultimaCompra", ignore = true)
    @Mapping(target = "deudaActual", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    Cliente toEntity(ClienteRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalComprado", ignore = true)
    @Mapping(target = "ultimaCompra", ignore = true)
    @Mapping(target = "deudaActual", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    void updateEntityFromDto(ClienteRequestDTO requestDTO, @MappingTarget Cliente cliente);
}