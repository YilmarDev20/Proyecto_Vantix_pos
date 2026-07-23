package com.vantix.pos.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 🚀 OBTENEMOS LA RUTA ABSOLUTA REAL DEL SISTEMA DE ARCHIVOS
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        String uploadPath = uploadDir.toFile().toURI().toString();

        // Imprime en consola para verificar dónde está buscando Spring las fotos en local
        System.out.println("📂 [RECURSOS ESTÁTICOS] Sirviendo /uploads/** desde: " + uploadPath);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}