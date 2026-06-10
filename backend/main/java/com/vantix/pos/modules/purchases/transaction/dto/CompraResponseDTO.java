package com.vantix.pos.modules.purchases.transaction.dto;

import com.vantix.pos.modules.purchases.transaction.enums.EstadoCompra;
import com.vantix.pos.modules.purchases.transaction.enums.MetodoPago;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CompraResponseDTO {
    private Integer id;
    private String proveedorRazonSocial;
    private String numeroComprobante;
    private LocalDateTime fechaCompra;
    private MetodoPago metodoPago;
    private EstadoCompra estadoCompra;
    private BigDecimal total;
    private BigDecimal saldoPendiente;
    private List<DetalleCompraDTO> detalles;
}