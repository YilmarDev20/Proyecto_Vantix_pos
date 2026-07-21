package com.vantix.pos.modules.transfers.entity;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "traslados_detalle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrasladoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traslado_id", nullable = false)
    private Traslado traslado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false)
    private Variante variante;

    @Column(nullable = false)
    private Integer cantidad;

    // 🚀 NUEVOS CAMPOS: Guardan la presentación exacta usada al enviar la mercadería
    @Column(name = "presentacion_nombre", length = 100)
    private String presentacionNombre;

    @Column(name = "factor_conversion")
    private Integer factorConversion;
}