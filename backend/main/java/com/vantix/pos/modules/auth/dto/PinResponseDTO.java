package com.vantix.pos.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PinResponseDTO {
    private String pinActual;
    private long segundosRestantes;
}