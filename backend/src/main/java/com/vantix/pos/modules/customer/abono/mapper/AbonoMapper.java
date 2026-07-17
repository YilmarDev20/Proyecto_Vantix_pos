package com.vantix.pos.modules.customer.abono.mapper;

import com.vantix.pos.modules.customer.abono.dto.AbonoResponseDTO;
import com.vantix.pos.modules.customer.abono.entity.AbonoCliente;
import com.vantix.pos.modules.customer.abono.entity.AbonoDetalle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AbonoMapper {

    @Mapping(target = "clienteId", source = "cliente.id")
    @Mapping(target = "clienteNombre", source = "cliente.nombreCompleto")
    AbonoResponseDTO toDto(AbonoCliente abono);

    @Mapping(target = "ventaId", source = "venta.id")
    @Mapping(target = "correlativoVenta", source = "venta.correlativo")
    AbonoResponseDTO.DetalleAbonoResDTO toDetalleDto(AbonoDetalle detalle);
}