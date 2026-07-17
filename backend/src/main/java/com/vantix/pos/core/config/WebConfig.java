package com.vantix.pos.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Esto le dice a Spring:
        // "Cuando alguien pida algo que empiece por /uploads/,
        // búscalo en la carpeta física 'uploads/' que está en la raíz de mi proyecto."

        // Esto cubre tanto /uploads/logos/ (tus logos viejos)
        // como /uploads/productos/ (tus nuevas fotos de productos)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}