package com.vantix.pos.modules.catalog.variant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Data
public class VarianteRequestDTO {
    @NotNull(message = "El ID del producto es obligatorio")
    private Integer productoId;
    private String sku;
    private String codigoBarras;
    private Map<String, Object> atributos;

    @NotNull(message = "El precio de compra es obligatorio")
    private BigDecimal precioCompra;
    @NotNull(message = "El precio de venta es obligatorio")
    private BigDecimal precioVenta;

    private BigDecimal precioMayorista;
    private Integer cantidadMayorista;
    private BigDecimal precioOferta;

    private Integer stockMinimo;
    private String imagenUrl;

    // NUEVO: Recibe la lista de presentaciones
    @Valid
    private List<PresentacionReqDTO> presentaciones;

    @Data
    public static class PresentacionReqDTO {
        private Integer id; // <--- CIRUGÍA AQUÍ: Agregamos el ID para poder actualizar el empaque existente
        @NotNull
        private String nombre;
        private String codigoBarras;
        @NotNull
        private Integer factorConversion;
        @NotNull
        private BigDecimal precioVenta;
    }
}