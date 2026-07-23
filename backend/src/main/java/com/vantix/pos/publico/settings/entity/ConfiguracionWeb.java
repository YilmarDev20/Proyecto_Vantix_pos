package com.vantix.pos.publico.settings.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "configuracion_web")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionWeb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🟢 Datos de Atencion y Pagos
    private String whatsappOficial;
    private String yapeTelefono;
    private String yapeTitular;
    private String yapeQrUrl;

    // 🟢 Categorias Destacadas (Lista de IDs - Máximo 3)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "configuracion_web_categorias", joinColumns = @JoinColumn(name = "configuracion_id"))
    @Column(name = "categoria_id")
    @Builder.Default
    private List<Integer> categoriasDestacadasIds = new ArrayList<>();

    // 🟢 Banners Promocionales para el Carrusel
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "configuracion_web_banners", joinColumns = @JoinColumn(name = "configuracion_id"))
    @Column(name = "banner_url")
    @Builder.Default
    private List<String> bannersUrls = new ArrayList<>();

    // 🟢 Redes Sociales
    private String facebookUrl;
    private String instagramUrl;
    private String tiktokUrl;
}