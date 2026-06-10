package com.vantix.pos.modules.sales.entity;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.entity.VariantePresentacion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ventas_detalle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id")
    private Variante variante;

    // ---> NUEVO: Guardamos exactamente qué empaque se vendió <---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "presentacion_id")
    private VariantePresentacion presentacion;

    @Column(name = "nombre_producto_historico", nullable = false)
    private String nombreProductoHistorico;

    @Column(name = "costo_unitario_historico", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoUnitarioHistorico;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "factor_conversion", nullable = false)
    @Builder.Default
    private Integer factorConversion = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "descuento_unitario", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal descuentoUnitario = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
}