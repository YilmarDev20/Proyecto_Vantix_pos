package com.vantix.pos.modules.customer.abono.entity;

import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.sales.enums.MetodoPagoVenta;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "abonos_cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbonoCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "turno_caja_id", nullable = false)
    private Integer turnoCajaId;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 50)
    private MetodoPagoVenta metodoPago;

    @Column(length = 100)
    private String referencia;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true; // false = Anulado

    @CreationTimestamp
    @Column(name = "fecha_abono", updatable = false)
    private LocalDateTime fechaAbono;

    @OneToMany(mappedBy = "abono", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AbonoDetalle> detalles = new ArrayList<>();

    public void addDetalle(AbonoDetalle detalle) {
        detalles.add(detalle);
        detalle.setAbono(this);
    }
}