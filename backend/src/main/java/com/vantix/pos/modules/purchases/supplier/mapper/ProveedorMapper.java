package com.vantix.pos.modules.purchases.supplier.mapper;

import com.vantix.pos.modules.purchases.supplier.dto.ProveedorResponseDTO;
import com.vantix.pos.modules.purchases.supplier.entity.Proveedor;
import org.springframework.stereotype.Component;

@Component
public class ProveedorMapper {

    public ProveedorResponseDTO toDto(Proveedor proveedor) {
        if (proveedor == null) return null;

        ProveedorResponseDTO dto = new ProveedorResponseDTO();
        dto.setId(proveedor.getId());
        dto.setDocumento(proveedor.getDocumento());
        dto.setRazonSocial(proveedor.getRazonSocial());
        dto.setNombreContacto(proveedor.getNombreContacto());
        dto.setTelefono(proveedor.getTelefono());
        dto.setEmail(proveedor.getEmail());
        dto.setDireccion(proveedor.getDireccion());
        dto.setEstado(proveedor.getEstado());
        return dto;
    }
}