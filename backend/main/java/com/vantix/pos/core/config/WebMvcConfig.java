package com.vantix.pos.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expone la carpeta física 'uploads' a la ruta web '/uploads/**'
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}