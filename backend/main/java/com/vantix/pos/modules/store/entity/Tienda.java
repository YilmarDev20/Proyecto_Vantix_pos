package com.vantix.pos.modules.store.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tiendas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(length = 20)
    private String telefono;

    @Column(name = "mensaje_ticket", columnDefinition = "TEXT")
    private String mensajeTicket;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true; // Aplicando la regla de Soft Delete

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    private Boolean esPrincipal;
}