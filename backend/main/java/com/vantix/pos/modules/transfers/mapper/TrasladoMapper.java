package com.vantix.pos.modules.transfers.mapper;

import com.vantix.pos.modules.transfers.dto.DetalleTrasladoResponseDTO;
import com.vantix.pos.modules.transfers.dto.TrasladoResponseDTO;
import com.vantix.pos.modules.transfers.entity.Traslado;
import com.vantix.pos.modules.transfers.entity.TrasladoDetalle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TrasladoMapper {

    TrasladoResponseDTO toDto(Traslado traslado);

    @Mapping(source = "variante.id", target = "varianteId")
    @Mapping(source = "variante.sku", target = "sku")
    @Mapping(source = "variante.producto.nombre", target = "nombreProducto")
    @Mapping(source = "variante.producto.marca", target = "marcaProducto") // <-- Extrae la marca
    @Mapping(source = "variante.atributos", target = "atributos")
    DetalleTrasladoResponseDTO toDetalleDto(TrasladoDetalle detalle);
}