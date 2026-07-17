package com.vantix.pos.modules.users.enums;

public enum RolUsuario {
    ROLE_ADMIN, // Acceso total, selector de tiendas, reportes globales.
    ROLE_SELLER // Acceso solo a POS, su historial y su caja de la tienda asignada.
}