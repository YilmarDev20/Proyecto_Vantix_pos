package com.vantix.pos.modules.finances.entity;

import com.vantix.pos.modules.finances.enums.EstadoTurno;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "turnos_caja")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TurnoCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tienda_id", nullable = false)
    private Integer tiendaId;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @CreationTimestamp
    @Column(name = "fecha_apertura", updatable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "monto_apertura", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoApertura;

    @Column(name = "total_ingresos", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalIngresos = BigDecimal.ZERO;

    @Column(name = "total_egresos", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalEgresos = BigDecimal.ZERO;

    @Column(name = "monto_cierre_declarado", precision = 10, scale = 2)
    private BigDecimal montoCierreDeclarado;

    @Column(name = "monto_cierre_sistema", precision = 10, scale = 2)
    private BigDecimal montoCierreSistema;

    @Column(name = "diferencia", precision = 10, scale = 2)
    private BigDecimal diferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_turno", length = 20)
    @Builder.Default
    private EstadoTurno estadoTurno = EstadoTurno.ABIERTO;
}