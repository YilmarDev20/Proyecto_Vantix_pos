package com.vantix.pos.publico.order.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PedidoWebResponseDTO {

    private Long id;
    private String codigoPedido;
    private String clienteNombre;
    private String clienteTelefono;
    private Integer tiendaId;
    private String tipoEntrega;
    private String metodoPago;
    private String comprobanteUrl;
    private BigDecimal montoTotal;
    private String estado;
    private LocalDateTime fechaCreacion;
    private List<ItemPedidoResponseDTO> detalles;

    @Data
    @Builder
    public static class ItemPedidoResponseDTO {
        private Long id;
        private Integer varianteId;
        private Integer presentacionId;
        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}