package com.vantix.pos.modules.catalog.product.entity;

import com.vantix.pos.modules.catalog.product.enums.UnidadMedida;
import com.vantix.pos.modules.category.entity.Categoria;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> etiquetas;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidad_medida", length = 20)
    @Builder.Default
    private UnidadMedida unidadMedida = UnidadMedida.NIU;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    @Column(length = 100)
    private String marca;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    // 🚀 NUEVO: Control de visibilidad para el E-Commerce
    @Column(name = "publicado_en_web", nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean publicadoEnWeb = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackSurtido> packsSurtidos;
}