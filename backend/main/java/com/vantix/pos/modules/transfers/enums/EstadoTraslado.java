package com.vantix.pos.modules.transfers.enums;

public enum EstadoTraslado {
    PENDIENTE,  // Salió del origen, está en tránsito (El stock origen ya se descontó)
    COMPLETADO, // Llegó al destino y fue aceptado (El stock destino ya sumó)
    RECHAZADO,  // El destino lo rechazó (El stock vuelve al origen)
    ANULADO     // El origen lo canceló antes de que llegue (El stock vuelve al origen)
}