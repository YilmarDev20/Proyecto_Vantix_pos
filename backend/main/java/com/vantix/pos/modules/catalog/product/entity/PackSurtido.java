package com.vantix.pos.modules.catalog.product.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pack_surtido")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackSurtido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relación fuerte con el Producto padre
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, length = 100)
    private String nombre; // Ej: "Docena Surtida", "Caja x50"

    @Column(name = "cantidad_requerida", nullable = false)
    private Integer cantidadRequerida; // Ej: 12

    // Usamos BigDecimal para dinero por precisión financiera
    @Column(name = "precio_pack", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPack; // Ej: 15.00

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;
}