package com.vantix.pos.modules.catalog.product.mapper;

import com.vantix.pos.modules.catalog.product.dto.*;
import com.vantix.pos.modules.catalog.product.entity.PackSurtido;
import com.vantix.pos.modules.catalog.product.entity.Producto;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductoMapper {
    @Mapping(target = "categoriaId", source = "categoria.id")
    ProductoResponseDTO toDto(Producto producto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    Producto toEntity(ProductoRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    void updateEntityFromDto(ProductoRequestDTO requestDTO, @MappingTarget Producto producto);

    @Mapping(target = "producto", ignore = true) // Evita bucles infinitos
    @Mapping(target = "estado", ignore = true)
    PackSurtido toPackEntity(PackSurtidoDTO dto);

    PackSurtidoDTO toPackDto(PackSurtido entity);
}