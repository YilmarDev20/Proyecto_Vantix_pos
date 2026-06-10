package com.vantix.pos.modules.inventory.kardex.entity;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.inventory.kardex.enums.OrigenMovimiento;
import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventario_kardex")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioKardex {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false)
    private Variante variante;

    // Relaciones temporales hasta que creemos los módulos de Tienda y Seguridad
    @Column(name = "tienda_id")
    private Integer tiendaId;

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private TipoMovimiento tipoMovimiento;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "stock_resultante", nullable = false)
    private Integer stockResultante;

    @Enumerated(EnumType.STRING)
    @Column(name = "origen_movimiento", length = 50)
    private OrigenMovimiento origenMovimiento;

    @Column(name = "es_autogenerado")
    @Builder.Default
    private Boolean esAutogenerado = false;

    @Column(name = "notas_internas", columnDefinition = "TEXT")
    private String notasInternas;

    @CreationTimestamp
    @Column(name = "fecha_movimiento", updatable = false)
    private LocalDateTime fechaMovimiento;
}