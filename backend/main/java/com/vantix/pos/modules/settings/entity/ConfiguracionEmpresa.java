package com.vantix.pos.modules.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_empresa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "razon_social", nullable = false, length = 200)
    private String razonSocial;

    @Column(name = "ruc_nit", nullable = false, length = 50)
    private String rucNit;

    @Column(name = "direccion_fiscal", columnDefinition = "TEXT")
    private String direccionFiscal;

    @Column(length = 50)
    @Builder.Default
    private String moneda = "Soles";

    @Column(name = "simbolo_moneda", length = 10)
    @Builder.Default
    private String simboloMoneda = "S/";

    @Column(name = "impuesto_nombre", length = 20)
    @Builder.Default
    private String impuestoNombre = "IGV";

    @Column(name = "impuesto_porcentaje", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal impuestoPorcentaje = new BigDecimal("18.00");

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "fecha_actualizacion", insertable = false, updatable = false)
    private LocalDateTime fechaActualizacion;
}