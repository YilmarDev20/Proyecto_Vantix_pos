package com.vantix.pos.modules.purchases.transaction.dto;

import com.vantix.pos.modules.purchases.transaction.enums.MetodoPago;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class NuevaCompraRequestDTO {
    @NotNull(message = "El proveedor es obligatorio")
    private Integer proveedorId;

    @NotBlank(message = "El número de comprobante es obligatorio")
    private String numeroComprobante;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPago metodoPago;

    @NotNull(message = "El total de la compra es obligatorio")
    private BigDecimal total;

    private Integer tiendaId;
    private Integer usuarioId;

    @NotEmpty(message = "La compra debe tener al menos un producto")
    @Valid
    private List<DetalleCompraDTO> detalles;
}