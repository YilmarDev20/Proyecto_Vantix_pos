package com.vantix.pos.modules.catalog.variant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Data
public class VarianteResponseDTO {
    private Integer id;
    private Integer productoId;

    private String productoNombre;
    private String marcaNombre;

    private String sku;
    private String codigoBarras;
    private Map<String, Object> atributos;
    private BigDecimal precioCompra;
    private BigDecimal costoPromedio;
    private BigDecimal precioVenta;
    private BigDecimal precioMayorista;
    private Integer cantidadMayorista;
    private BigDecimal precioOferta;
    private Integer stockActual;
    private Integer stockMinimo;
    private String imagenUrl;
    private Boolean estado;

    private Boolean publicadoEnWeb;

    private List<PresentacionResDTO> presentaciones;

    @Data
    public static class PresentacionResDTO {
        private Integer id;
        private String nombre;
        private String codigoBarras;
        private Integer factorConversion;
        private BigDecimal precioVenta;
        private Boolean estado;

        // 🚀 NUEVO: Respuesta de visibilidad individual para el empaque
        private Boolean publicadoEnWeb;
    }
}