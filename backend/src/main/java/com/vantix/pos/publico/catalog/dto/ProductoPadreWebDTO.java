package com.vantix.pos.publico.catalog.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductoPadreWebDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
    private String marca;
    private String imagenUrl;
    private Integer categoriaId;
    private String categoriaNombre;
    private List<String> etiquetas;

    private BigDecimal precioDesde;
    private BigDecimal precioHasta;
    private Integer stockTotalTienda;

    // Relaciones
    private List<VarianteWebDTO> variantes;
    private List<PackSurtidoWebDTO> packsSurtidos;

    // 🚀 NUEVO: Estados cualitativos de disponibilidad por sede para la Web
    private List<DisponibilidadSedeDTO> disponibilidadesSedes;

    @Data
    @Builder
    public static class DisponibilidadSedeDTO {
        private Integer tiendaId;
        private String tiendaNombre;
        private String estadoStock; // "DISPONIBLE", "ULTIMAS_UNIDADES", "AGOTADO"
        private Integer stock;       // 🚀 NUEVO: Cantidad exacta de stock numérico en esta sede
    }

    @Data
    @Builder
    public static class VarianteWebDTO {
        private Integer id;
        private String sku;
        private String codigoBarras;
        private String nombreVariante;
        private Object atributos;
        private BigDecimal precioVenta;
        private BigDecimal precioOferta;
        private BigDecimal precioMayorista;
        private Integer cantidadMayorista;
        private String imagenUrl;
        private Integer stockActual;
        private List<PresentacionWebDTO> presentaciones;
        // 🚀 NUEVO: Estados de stock por sede de la variante
        private List<DisponibilidadSedeDTO> disponibilidadesSedes;
    }

    @Data
    @Builder
    public static class PresentacionWebDTO {
        private Integer id;
        private String nombre;
        private String codigoBarras;
        private Integer factorConversion;
        private BigDecimal precioVenta;
    }

    @Data
    @Builder
    public static class PackSurtidoWebDTO {
        private Integer id;
        private String nombre;
        private Integer cantidadRequerida;
        private BigDecimal precioPack;
    }
}