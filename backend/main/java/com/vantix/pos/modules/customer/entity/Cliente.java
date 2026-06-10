package com.vantix.pos.modules.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tipo_documento", length = 20)
    private String tipoDocumento;

    // ---> ACTUALIZADO: Ya no es obligatorio ni único
    @Column(name = "numero_documento", length = 50)
    private String numeroDocumento;

    @Column(name = "nombre_completo", nullable = false, length = 200)
    private String nombreCompleto;

    @Column(length = 20)
    private String telefono;

    @Column(length = 150)
    private String email;

    @Column(name = "total_comprado", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalComprado = BigDecimal.ZERO;

    @Column(name = "ultima_compra")
    private LocalDateTime ultimaCompra;

    @Column(name = "linea_credito_maxima", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lineaCreditoMaxima = BigDecimal.ZERO;

    @Column(name = "deuda_actual", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deudaActual = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}