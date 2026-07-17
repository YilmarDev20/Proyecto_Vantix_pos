package com.vantix.pos.modules.catalog.product.service;

import com.vantix.pos.modules.catalog.product.dto.ProductoRequestDTO;
import com.vantix.pos.modules.catalog.product.dto.ProductoResponseDTO;
import java.util.List;

public interface ProductoService {
    List<ProductoResponseDTO> obtenerTodos();
    ProductoResponseDTO obtenerPorId(Integer id);
    ProductoResponseDTO crear(ProductoRequestDTO requestDTO);
    ProductoResponseDTO actualizar(Integer id, ProductoRequestDTO requestDTO);
    void eliminar(Integer id);
    ProductoResponseDTO cambiarEstado(Integer id);
}