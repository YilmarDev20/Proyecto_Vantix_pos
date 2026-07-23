package com.vantix.pos.publico.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vantix.pos.publico.order.dto.CrearPedidoWebDTO;
import com.vantix.pos.publico.order.dto.PedidoWebResponseDTO;
import com.vantix.pos.publico.order.service.PedidoWebService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/public/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 👈 OBLIGATORIO PARA NEXT.JS
public class PedidoWebPublicController {

    private final PedidoWebService pedidoWebService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PedidoWebResponseDTO> crearPedido(
            @RequestPart("datos") String datosJson,
            @RequestPart(value = "comprobante", required = false) MultipartFile comprobante) throws Exception {

        CrearPedidoWebDTO dto = objectMapper.readValue(datosJson, CrearPedidoWebDTO.class);
        PedidoWebResponseDTO response = pedidoWebService.crearPedido(dto, comprobante);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<PedidoWebResponseDTO> obtenerPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(pedidoWebService.obtenerPorCodigo(codigo));
    }
}