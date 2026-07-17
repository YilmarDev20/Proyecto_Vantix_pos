package com.vantix.pos.modules.sales.mapper;

import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import com.vantix.pos.modules.sales.entity.Venta;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
import java.util.Collections;

@Component
public class VentaMapper {
    public VentaResponseDTO toDto(Venta venta) {
        if (venta == null) return null;
        VentaResponseDTO dto = new VentaResponseDTO();
        dto.setId(venta.getId());
        dto.setCorrelativo(venta.getCorrelativo());
        dto.setClienteNombre(venta.getCliente() != null ? venta.getCliente().getNombreCompleto() : "Cliente General");
        dto.setTipoComprobante(venta.getTipoComprobante());

        dto.setSubtotal(venta.getSubtotal());
        dto.setDescuentoTotal(venta.getDescuentoTotal());
        dto.setTotalFinal(venta.getTotalFinal());
        dto.setEstadoVenta(venta.getEstadoVenta());

        // ---> MAPEO DE LOS NUEVOS CAMPOS FINANCIEROS <---
        dto.setEstadoPago(venta.getEstadoPago());
        dto.setSaldoPendiente(venta.getSaldoPendiente());

        dto.setFechaVenta(venta.getFechaVenta());

        if (venta.getDetalles() != null) {
            dto.setDetalles(venta.getDetalles().stream().map(detalle -> {
                VentaResponseDTO.DetalleVentaResDTO detDto = new VentaResponseDTO.DetalleVentaResDTO();
                detDto.setId(detalle.getId());
                detDto.setNombreProductoHistorico(detalle.getNombreProductoHistorico());
                detDto.setCantidad(detalle.getCantidad());
                detDto.setPrecioUnitario(detalle.getPrecioUnitario());
                detDto.setDescuentoUnitario(detalle.getDescuentoUnitario());
                detDto.setSubtotal(detalle.getSubtotal());

                // ---> LA MAGIA: Extraemos el factor de la base de datos <---
                detDto.setFactorConversion(detalle.getFactorConversion());

                return detDto;
            }).collect(Collectors.toList()));
        } else {
            dto.setDetalles(Collections.emptyList());
        }

        if (venta.getPagos() != null) {
            dto.setPagos(venta.getPagos().stream().map(pago -> {
                VentaResponseDTO.PagoVentaResDTO pagoDto = new VentaResponseDTO.PagoVentaResDTO();
                pagoDto.setId(pago.getId());
                pagoDto.setMetodoPago(pago.getMetodoPago() != null ? pago.getMetodoPago().name() : "DESCONOCIDO");
                pagoDto.setMontoPagado(pago.getMontoPagado());
                pagoDto.setReferencia(pago.getReferencia());
                return pagoDto;
            }).collect(Collectors.toList()));
        } else {
            dto.setPagos(Collections.emptyList());
        }

        return dto;
    }
}