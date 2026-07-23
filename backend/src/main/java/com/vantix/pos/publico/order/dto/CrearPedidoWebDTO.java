package com.vantix.pos.publico.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CrearPedidoWebDTO {

    private String clienteNombre;
    private String clienteTelefono;
    private Integer tiendaId; // Sede de recojo (1: Independencia, 2: Dos Palmas)
    private String metodoPago; // "YAPE", "PLIN", "EFECTIVO"
    private BigDecimal montoTotal;
    private List<ItemPedidoDTO> items;

    @Data
    public static class ItemPedidoDTO {
        private Integer varianteId;
        private Integer presentacionId;
        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}