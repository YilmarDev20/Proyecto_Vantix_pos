package com.vantix.pos.modules.catalog.variant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "variante_presentaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantePresentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false)
    private Variante variante;

    @Column(nullable = false, length = 100)
    private String nombre; // Ej: "Pack x10", "Caja Cerrada"

    @Column(name = "codigo_barras", unique = true, length = 100)
    private String codigoBarras;

    @Column(name = "factor_conversion", nullable = false)
    private Integer factorConversion;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 4)
    private BigDecimal precioVenta;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    // 🚀 NUEVO: Switch individual para visibilidad del empaque en la tienda web
    @Column(name = "publicado_en_web", nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean publicadoEnWeb = true;
}