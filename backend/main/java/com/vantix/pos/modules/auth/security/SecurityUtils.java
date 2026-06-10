package com.vantix.pos.modules.auth.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    /**
     * Obtiene los detalles completos del usuario logueado actualmente.
     */
    public static CustomUserDetails getUsuarioLogueado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) authentication.getPrincipal();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad.");
    }

    /**
     * Extrae dinámicamente el ID del usuario autenticado.
     */
    public static Integer getUsuarioId() {
        return getUsuarioLogueado().getUsuario().getId();
    }

    /**
     * Extrae dinámicamente el ID de la tienda a la que pertenece el usuario.
     */
    public static Integer getTiendaId() {
        if (getUsuarioLogueado().getUsuario().getTienda() != null) {
            return getUsuarioLogueado().getUsuario().getTienda().getId();
        }
        throw new IllegalStateException("El usuario no tiene una tienda base asignada.");
    }
}