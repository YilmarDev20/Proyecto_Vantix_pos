package com.vantix.pos.modules.transfers.entity;

import com.vantix.pos.modules.transfers.enums.EstadoTraslado;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "traslados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Traslado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Ej: TR-000001
    @Column(nullable = false, unique = true, length = 50)
    private String correlativo;

    // Usamos Integer para mantener tu arquitectura limpia y evitar joins pesados
    @Column(name = "tienda_origen_id", nullable = false)
    private Integer tiendaOrigenId;

    @Column(name = "tienda_destino_id", nullable = false)
    private Integer tiendaDestinoId;

    @Column(name = "usuario_creador_id", nullable = false)
    private Integer usuarioCreadorId;

    @Column(name = "usuario_receptor_id")
    private Integer usuarioReceptorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_traslado", nullable = false, length = 20)
    private EstadoTraslado estadoTraslado;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    // Relación con los detalles (los productos que viajan)
    @OneToMany(mappedBy = "traslado", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrasladoDetalle> detalles = new ArrayList<>();

    // Método helper para agregar detalles limpiamente
    public void addDetalle(TrasladoDetalle detalle) {
        detalles.add(detalle);
        detalle.setTraslado(this);
    }
}