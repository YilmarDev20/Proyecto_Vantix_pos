package com.vantix.pos.modules.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "tienda_id")
    private Integer tiendaId;

    // Ej: INVENTARIO, VENTAS, CAJA, COMPRAS
    @Column(nullable = false, length = 50)
    private String modulo;

    // Ej: CREAR, ACTUALIZAR, ELIMINAR, ANULAR
    @Column(nullable = false, length = 50)
    private String accion;

    // El ID del producto, venta o cliente modificado
    @Column(name = "entidad_id")
    private Integer entidadId;

    // Ej: "El usuario Admin cambió el precio de la Variante ESC-001"
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    // Magia JSON: Guarda cómo estaba ANTES
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "valores_anteriores", columnDefinition = "jsonb")
    private String valoresAnteriores;

    // Magia JSON: Guarda cómo quedó DESPUÉS
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "valores_nuevos", columnDefinition = "jsonb")
    private String valoresNuevos;

    @Column(name = "direccion_ip", length = 45)
    private String direccionIp;

    @CreationTimestamp
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;
}