package com.vantix.pos.publico.order.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido_web")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoWeb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_pedido", nullable = false, unique = true, length = 30)
    private String codigoPedido; // Ej: ZAR-1001

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(name = "cliente_telefono", nullable = false, length = 20)
    private String clienteTelefono;

    @Column(name = "tienda_id", nullable = false)
    private Integer tiendaId; // Sede de recojo (1: Independencia, 2: Dos Palmas, etc.)

    @Column(name = "tipo_entrega", nullable = false, length = 30)
    private String tipoEntrega; // Por ahora: "RECOJO_TIENDA"

    @Column(name = "metodo_pago", nullable = false, length = 30)
    private String metodoPago; // "YAPE", "PLIN", "EFECTIVO"

    @Column(name = "comprobante_url", length = 255)
    private String comprobanteUrl; // Ruta de la foto del Yape subida

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoPedidoWeb estado; // PENDIENTE, CONFIRMADO, ENTREGADO, CANCELADO

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "pedidoWeb", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PedidoWebDetalle> detalles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoPedidoWeb.PENDIENTE;
        }
        if (this.tipoEntrega == null) {
            this.tipoEntrega = "RECOJO_TIENDA";
        }
    }

    public enum EstadoPedidoWeb {
        PENDIENTE,
        CONFIRMADO,
        ENTREGADO,
        CANCELADO
    }
}