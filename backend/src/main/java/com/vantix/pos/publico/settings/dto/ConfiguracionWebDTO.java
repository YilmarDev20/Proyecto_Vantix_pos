package com.vantix.pos.publico.settings.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ConfiguracionWebDTO {
    private Long id;
    private String whatsappOficial;
    private String yapeTelefono;
    private String yapeTitular;
    private String yapeQrUrl;
    private List<Integer> categoriasDestacadasIds;
    private List<String> bannersUrls;
    private String facebookUrl;
    private String instagramUrl;
    private String tiktokUrl;
}