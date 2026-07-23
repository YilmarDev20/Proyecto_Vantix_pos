package com.vantix.pos.modules.catalog.variant.entity;

import com.vantix.pos.modules.catalog.product.entity.Producto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "variantes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Variante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "codigo_barras", unique = true, length = 100)
    private String codigoBarras;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> atributos;

    @Column(name = "precio_compra", nullable = false, precision = 10, scale = 4)
    private BigDecimal precioCompra;

    @Column(name = "costo_promedio", precision = 10, scale = 4)
    private BigDecimal costoPromedio;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 4)
    private BigDecimal precioVenta;

    @Column(name = "precio_mayorista", precision = 10, scale = 4)
    private BigDecimal precioMayorista;

    @Column(name = "cantidad_mayorista")
    private Integer cantidadMayorista;

    @Column(name = "precio_oferta", precision = 10, scale = 4)
    private BigDecimal precioOferta;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    // 🚀 NUEVO: Interruptor individual para el e-commerce
    @Column(name = "publicado_en_web", nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean publicadoEnWeb = true;

    @OneToMany(mappedBy = "variante", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VariantePresentacion> presentaciones = new ArrayList<>();

    public void addPresentacion(VariantePresentacion presentacion) {
        presentaciones.add(presentacion);
        presentacion.setVariante(this);
    }
}