package com.vantix.pos.publico.catalog.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Data
public class CatalogoWebResponseDTO {
    private Integer id;
    private Integer productoId;
    private String productoNombre;
    private String marcaNombre;
    private String sku;
    private String codigoBarras;
    private Map<String, Object> atributos;
    private BigDecimal precioVenta;
    private BigDecimal precioMayorista;
    private Integer cantidadMayorista;
    private BigDecimal precioOferta;
    private Integer stockActual;
    private String imagenUrl;
    private List<PresentacionPublicaDTO> presentaciones;

    @Data
    public static class PresentacionPublicaDTO {
        private Integer id;
        private String nombre;
        private String codigoBarras;
        private Integer factorConversion;
        private BigDecimal precioVenta;
    }
}