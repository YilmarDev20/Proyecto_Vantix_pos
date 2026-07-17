package com.vantix.pos.modules.purchases.transaction.enums;

public enum MetodoPago {
    EFECTIVO,
    YAPE,
    PLIN,
    TARJETA,
    TRANSFERENCIA,
    CREDITO // Agregamos CREDITO porque una compra a crédito no genera movimiento en caja al instante
}