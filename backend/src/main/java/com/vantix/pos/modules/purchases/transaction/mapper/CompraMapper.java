package com.vantix.pos.modules.purchases.transaction.mapper;

import com.vantix.pos.modules.purchases.transaction.dto.CompraResponseDTO;
import com.vantix.pos.modules.purchases.transaction.dto.DetalleCompraDTO;
import com.vantix.pos.modules.purchases.transaction.entity.Compra;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CompraMapper {

    public CompraResponseDTO toDto(Compra compra) {
        if (compra == null) return null;

        CompraResponseDTO dto = new CompraResponseDTO();
        dto.setId(compra.getId());
        dto.setProveedorRazonSocial(compra.getProveedor().getRazonSocial());
        dto.setNumeroComprobante(compra.getNumeroComprobante());
        dto.setFechaCompra(compra.getFechaCompra());
        dto.setMetodoPago(compra.getMetodoPago());
        dto.setEstadoCompra(compra.getEstadoCompra());
        dto.setTotal(compra.getTotal());
        dto.setSaldoPendiente(compra.getSaldoPendiente());

        // CORRECCIÓN: Ahora sí extraemos los detalles de la BD y los enviamos al Frontend
        if (compra.getDetalles() != null) {
            dto.setDetalles(compra.getDetalles().stream().map(detalle -> {
                DetalleCompraDTO detDto = new DetalleCompraDTO();
                detDto.setVarianteId(detalle.getVariante().getId());
                detDto.setCantidad(detalle.getCantidad());
                detDto.setPrecioUnitario(detalle.getPrecioUnitario());
                return detDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}