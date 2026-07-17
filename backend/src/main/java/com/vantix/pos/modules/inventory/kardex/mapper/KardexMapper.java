package com.vantix.pos.modules.inventory.kardex.mapper;

import com.vantix.pos.modules.inventory.kardex.dto.KardexResponseDTO;
import com.vantix.pos.modules.inventory.kardex.entity.InventarioKardex;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface KardexMapper {
    @Mapping(target = "varianteId", source = "variante.id")
    @Mapping(target = "varianteSku", source = "variante.sku")
    @Mapping(target = "tiendaNombre", ignore = true) // Llenado en Service
    @Mapping(target = "varianteNombre", ignore = true) // ---> AÑADIR ESTO: Llenado en Service
    KardexResponseDTO toDto(InventarioKardex kardex);
}