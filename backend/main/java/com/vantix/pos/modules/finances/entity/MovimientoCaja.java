package com.vantix.pos.modules.finances.entity;

import com.vantix.pos.modules.finances.enums.MetodoPago;
import com.vantix.pos.modules.finances.enums.TipoMovimientoCaja;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_caja")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_caja_id", nullable = false)
    private TurnoCaja turnoCaja;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private TipoMovimientoCaja tipoMovimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 20)
    private MetodoPago metodoPago;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 200)
    private String concepto;

    @CreationTimestamp
    @Column(name = "fecha_movimiento", updatable = false)
    private LocalDateTime fechaMovimiento;
}