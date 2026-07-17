package com.vantix.pos.modules.sales.entity;

import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.sales.enums.EstadoPagoVenta;
import com.vantix.pos.modules.sales.enums.EstadoVenta;
import com.vantix.pos.modules.sales.enums.TipoComprobante;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tienda_id")
    private Integer tiendaId;

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "turno_caja_id")
    private Integer turnoCajaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_comprobante", nullable = false, length = 20)
    private TipoComprobante tipoComprobante;

    @Column(nullable = false, length = 50)
    private String correlativo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "descuento_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal descuentoTotal = BigDecimal.ZERO;

    @Column(name = "impuesto_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal impuestoTotal = BigDecimal.ZERO;

    @Column(name = "total_final", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFinal;

    @Column(name = "pago_recibido", nullable = false, precision = 10, scale = 2)
    private BigDecimal pagoRecibido;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal vuelto;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_venta", length = 20)
    @Builder.Default
    private EstadoVenta estadoVenta = EstadoVenta.COMPLETADA;

    // ---> NUEVOS CAMPOS FINANCIEROS PARA LOS ABONOS <---
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", length = 20)
    @Builder.Default
    private EstadoPagoVenta estadoPago = EstadoPagoVenta.PAGADO;

    @Column(name = "saldo_pendiente", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal saldoPendiente = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "fecha_venta", updatable = false)
    private LocalDateTime fechaVenta;

    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VentaDetalle> detalles = new ArrayList<>();

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PagoVenta> pagos = new ArrayList<>();

    public void addDetalle(VentaDetalle detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }

    public void addPago(PagoVenta pago) {
        pagos.add(pago);
        pago.setVenta(this);
    }
}