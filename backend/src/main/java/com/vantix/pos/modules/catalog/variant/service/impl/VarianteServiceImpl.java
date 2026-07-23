package com.vantix.pos.modules.catalog.variant.service.impl;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.product.repository.ProductoRepository;
import com.vantix.pos.modules.catalog.variant.dto.VarianteRequestDTO;
import com.vantix.pos.modules.catalog.variant.dto.VarianteResponseDTO;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.entity.VariantePresentacion;
import com.vantix.pos.modules.catalog.variant.mapper.VarianteMapper;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.catalog.variant.service.VarianteService;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;
import com.vantix.pos.modules.store.entity.Tienda;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VarianteServiceImpl implements VarianteService {

    private final VarianteRepository varianteRepository;
    private final ProductoRepository productoRepository;
    private final VarianteMapper varianteMapper;
    private final InventarioTiendaRepository inventarioTiendaRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<VarianteResponseDTO> obtenerTodas(Integer tiendaId) {
        return varianteRepository.findAll().stream()
                .map(variante -> {
                    VarianteResponseDTO dto = varianteMapper.toDto(variante);

                    InventarioTienda inventario = inventarioTiendaRepository
                            .findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                            .orElse(null);

                    dto.setStockActual(inventario != null ? inventario.getStockActual() : 0);
                    dto.setStockMinimo(inventario != null ? inventario.getStockMinimo() : 5);

                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VarianteResponseDTO obtenerPorId(Integer id) {
        Variante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));
        return varianteMapper.toDto(variante);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VarianteResponseDTO> obtenerPorProducto(Integer productoId, Integer tiendaId) {
        return varianteRepository.findByProductoId(productoId).stream()
                .map(variante -> {
                    VarianteResponseDTO dto = varianteMapper.toDto(variante);

                    InventarioTienda inventario = inventarioTiendaRepository
                            .findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                            .orElse(null);

                    dto.setStockActual(inventario != null ? inventario.getStockActual() : 0);
                    dto.setStockMinimo(inventario != null ? inventario.getStockMinimo() : 5);

                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VarianteResponseDTO crear(VarianteRequestDTO requestDTO, Integer tiendaIdParam) {
        if (requestDTO.getPrecioVenta() != null && requestDTO.getPrecioCompra() != null &&
                requestDTO.getPrecioVenta().compareTo(requestDTO.getPrecioCompra()) < 0) {
            throw new IllegalArgumentException("El precio de venta no puede ser menor que el costo de compra.");
        }

        Variante variante = varianteMapper.toEntity(requestDTO);
        variante.setEstado(true);
        variante.setCostoPromedio(requestDTO.getPrecioCompra());

        // 🚀 LÓGICA E-COMMERCE: Asigna publicadoEnWeb de la Variante
        if (requestDTO.getPublicadoEnWeb() != null) {
            variante.setPublicadoEnWeb(requestDTO.getPublicadoEnWeb());
        } else {
            variante.setPublicadoEnWeb(true);
        }

        Producto producto = productoRepository.findById(requestDTO.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto padre no encontrado con ID: " + requestDTO.getProductoId()));
        variante.setProducto(producto);

        if (requestDTO.getSku() == null || requestDTO.getSku().isBlank()) {
            variante.setSku(generarSku(producto));
        }

        if (requestDTO.getCodigoBarras() == null || requestDTO.getCodigoBarras().isBlank()) {
            variante.setCodigoBarras(generarCodigoBarrasUnico());
        } else {
            if (varianteRepository.existsByCodigoBarras(requestDTO.getCodigoBarras())) {
                throw new IllegalArgumentException("El código de barras ingresado ya está registrado en otro producto.");
            }
            variante.setCodigoBarras(requestDTO.getCodigoBarras());
        }

        if (requestDTO.getPresentaciones() != null && !requestDTO.getPresentaciones().isEmpty()) {
            for (VarianteRequestDTO.PresentacionReqDTO pReq : requestDTO.getPresentaciones()) {
                VariantePresentacion vp = VariantePresentacion.builder()
                        .nombre(pReq.getNombre())
                        .codigoBarras(pReq.getCodigoBarras() != null && !pReq.getCodigoBarras().isBlank() ? pReq.getCodigoBarras() : generarCodigoBarrasUnico())
                        .factorConversion(pReq.getFactorConversion())
                        .precioVenta(pReq.getPrecioVenta())
                        .publicadoEnWeb(pReq.getPublicadoEnWeb() != null ? pReq.getPublicadoEnWeb() : true) // 🚀 PERSISTENCIA PUBLICADO_EN_WEB
                        .estado(true)
                        .build();
                variante.addPresentacion(vp);
            }
        }

        Variante varianteGuardada = varianteRepository.save(variante);
        Integer tiendaId = (tiendaIdParam != null) ? tiendaIdParam : SecurityUtils.getTiendaId();

        InventarioTienda inventarioInicial = new InventarioTienda();
        inventarioInicial.setVariante(varianteGuardada);

        Tienda tiendaProxy = new Tienda();
        tiendaProxy.setId(tiendaId);
        inventarioInicial.setTienda(tiendaProxy);

        inventarioInicial.setStockActual(0);
        inventarioInicial.setStockMinimo(requestDTO.getStockMinimo() != null ? requestDTO.getStockMinimo() : 5);

        inventarioTiendaRepository.save(inventarioInicial);

        VarianteResponseDTO responseDTO = varianteMapper.toDto(varianteGuardada);
        responseDTO.setStockActual(inventarioInicial.getStockActual());
        responseDTO.setStockMinimo(inventarioInicial.getStockMinimo());

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(tiendaId)
                .modulo("CATALOGO_VARIANTE").accion("CREAR")
                .entidadId(varianteGuardada.getId())
                .descripcion("Se creó una nueva variante (SKU: " + varianteGuardada.getSku() + ")")
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public VarianteResponseDTO actualizar(Integer id, VarianteRequestDTO requestDTO, Integer tiendaIdParam) {
        if (requestDTO.getPrecioVenta() != null && requestDTO.getPrecioCompra() != null &&
                requestDTO.getPrecioVenta().compareTo(requestDTO.getPrecioCompra()) < 0) {
            throw new IllegalArgumentException("El precio de venta no puede ser menor que el costo de compra.");
        }

        Variante varianteAnterior = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));

        VarianteResponseDTO fotoAnterior = varianteMapper.toDto(varianteAnterior);

        if (requestDTO.getCodigoBarras() != null && !requestDTO.getCodigoBarras().isBlank()) {
            if (varianteRepository.existsByCodigoBarrasAndIdNot(requestDTO.getCodigoBarras(), id)) {
                throw new IllegalArgumentException("El código de barras ingresado ya está siendo usado por otro producto.");
            }
        } else {
            requestDTO.setCodigoBarras(generarCodigoBarrasUnico());
        }

        varianteMapper.updateEntityFromDto(requestDTO, varianteAnterior);

        // 🚀 LÓGICA E-COMMERCE: Actualiza el estado individual de visibilidad web de la variante
        if (requestDTO.getPublicadoEnWeb() != null) {
            varianteAnterior.setPublicadoEnWeb(requestDTO.getPublicadoEnWeb());
        }

        varianteAnterior.setCostoPromedio(requestDTO.getPrecioCompra());

        Producto producto = productoRepository.findById(requestDTO.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto padre no encontrado con ID: " + requestDTO.getProductoId()));
        varianteAnterior.setProducto(producto);

        if (requestDTO.getPresentaciones() != null) {
            Set<Integer> idsRequest = requestDTO.getPresentaciones().stream()
                    .filter(p -> p.getId() != null)
                    .map(VarianteRequestDTO.PresentacionReqDTO::getId)
                    .collect(Collectors.toSet());

            varianteAnterior.getPresentaciones().removeIf(p -> p.getId() != null && !idsRequest.contains(p.getId()));

            for (VarianteRequestDTO.PresentacionReqDTO pReq : requestDTO.getPresentaciones()) {
                if (pReq.getId() != null) {
                    varianteAnterior.getPresentaciones().stream()
                            .filter(p -> p.getId().equals(pReq.getId()))
                            .findFirst()
                            .ifPresent(vp -> {
                                vp.setNombre(pReq.getNombre());
                                vp.setCodigoBarras(pReq.getCodigoBarras() != null && !pReq.getCodigoBarras().isBlank() ? pReq.getCodigoBarras() : vp.getCodigoBarras());
                                vp.setFactorConversion(pReq.getFactorConversion());
                                vp.setPrecioVenta(pReq.getPrecioVenta());
                                // 🚀 ACTUALIZACIÓN PUBLICADO_EN_WEB
                                if (pReq.getPublicadoEnWeb() != null) {
                                    vp.setPublicadoEnWeb(pReq.getPublicadoEnWeb());
                                }
                            });
                } else {
                    VariantePresentacion vpNuevo = VariantePresentacion.builder()
                            .nombre(pReq.getNombre())
                            .codigoBarras(pReq.getCodigoBarras() != null && !pReq.getCodigoBarras().isBlank() ? pReq.getCodigoBarras() : generarCodigoBarrasUnico())
                            .factorConversion(pReq.getFactorConversion())
                            .precioVenta(pReq.getPrecioVenta())
                            .publicadoEnWeb(pReq.getPublicadoEnWeb() != null ? pReq.getPublicadoEnWeb() : true) // 🚀 PERSISTENCIA PUBLICADO_EN_WEB
                            .estado(true)
                            .build();
                    varianteAnterior.addPresentacion(vpNuevo);
                }
            }
        } else {
            varianteAnterior.getPresentaciones().clear();
        }

        Variante varianteActualizada = varianteRepository.save(varianteAnterior);
        Integer tiendaId = (tiendaIdParam != null) ? tiendaIdParam : SecurityUtils.getTiendaId();

        InventarioTienda inventario = inventarioTiendaRepository
                .findByVarianteIdAndTiendaId(varianteActualizada.getId(), tiendaId)
                .orElseGet(() -> {
                    InventarioTienda nuevoInventario = new InventarioTienda();
                    nuevoInventario.setVariante(varianteActualizada);

                    Tienda tiendaProxy = new Tienda();
                    tiendaProxy.setId(tiendaId);
                    nuevoInventario.setTienda(tiendaProxy);

                    nuevoInventario.setStockActual(0);
                    return nuevoInventario;
                });

        if (requestDTO.getStockMinimo() != null) {
            inventario.setStockMinimo(requestDTO.getStockMinimo());
        }
        inventarioTiendaRepository.save(inventario);

        VarianteResponseDTO fotoNueva = varianteMapper.toDto(varianteActualizada);
        fotoNueva.setStockActual(inventario.getStockActual());
        fotoNueva.setStockMinimo(inventario.getStockMinimo());

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(tiendaId)
                .modulo("CATALOGO_VARIANTE").accion("ACTUALIZAR")
                .entidadId(varianteActualizada.getId())
                .descripcion("Se actualizaron datos o empaques de la variante (SKU: " + varianteActualizada.getSku() + ")")
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Variante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));

        VarianteResponseDTO fotoAnterior = varianteMapper.toDto(variante);

        inventarioTiendaRepository.deleteByVarianteId(id);
        varianteRepository.delete(variante);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_VARIANTE").accion("ELIMINAR_PERMANENTE")
                .entidadId(id)
                .descripcion("Se eliminó permanentemente la variante (SKU: " + variante.getSku() + ")")
                .valorAnterior(fotoAnterior).valorNuevo(null).direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public VarianteResponseDTO cambiarEstado(Integer id) {
        Variante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada con ID: " + id));

        VarianteResponseDTO fotoAnterior = varianteMapper.toDto(variante);

        variante.setEstado(!variante.getEstado());
        Variante varianteActualizada = varianteRepository.save(variante);
        VarianteResponseDTO fotoNueva = varianteMapper.toDto(varianteActualizada);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_VARIANTE").accion("CAMBIO_ESTADO")
                .entidadId(varianteActualizada.getId())
                .descripcion("Se cambió el estado a " + (varianteActualizada.getEstado() ? "ACTIVO" : "INACTIVO") + " (SKU: " + varianteActualizada.getSku() + ")")
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional(readOnly = true)
    public void exportarPdf(HttpServletResponse response, Integer tiendaId) {
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=variantes_catalogo.pdf");

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, response.getOutputStream());

            document.open();
            Paragraph title = new Paragraph("REPORTE DE VARIANTES DE CATÁLOGO");
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.addCell("ID");
            table.addCell("SKU");
            table.addCell("Código Barras");
            table.addCell("P. Compra");
            table.addCell("P. Venta");
            table.addCell("Stock");

            List<VarianteResponseDTO> variantes = obtenerTodas(tiendaId);
            for (VarianteResponseDTO v : variantes) {
                table.addCell(String.valueOf(v.getId()));
                table.addCell(v.getSku() != null ? v.getSku() : "");
                table.addCell(v.getCodigoBarras() != null ? v.getCodigoBarras() : "");
                table.addCell(String.valueOf(v.getPrecioCompra()));
                table.addCell(String.valueOf(v.getPrecioVenta()));
                table.addCell(String.valueOf(v.getStockActual()));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el archivo PDF de variantes", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void exportarExcel(HttpServletResponse response, Integer tiendaId) {
        try (Workbook workbook = new XSSFWorkbook()) {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=variantes_catalogo.xlsx");

            Sheet sheet = workbook.createSheet("Catálogo Variantes");
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("ID");
            headerRow.createCell(1).setCellValue("SKU");
            headerRow.createCell(2).setCellValue("Código Barras");
            headerRow.createCell(3).setCellValue("Precio Compra");
            headerRow.createCell(4).setCellValue("Precio Venta");
            headerRow.createCell(5).setCellValue("Stock Actual");
            headerRow.createCell(6).setCellValue("Stock Mínimo");

            List<VarianteResponseDTO> variantes = obtenerTodas(tiendaId);
            int rowIdx = 1;
            for (VarianteResponseDTO v : variantes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(v.getId());
                row.createCell(1).setCellValue(v.getSku() != null ? v.getSku() : "");
                row.createCell(2).setCellValue(v.getCodigoBarras() != null ? v.getCodigoBarras() : "");
                row.createCell(3).setCellValue(v.getPrecioCompra() != null ? v.getPrecioCompra().doubleValue() : 0.0);
                row.createCell(4).setCellValue(v.getPrecioVenta() != null ? v.getPrecioVenta().doubleValue() : 0.0);
                row.createCell(5).setCellValue(v.getStockActual());
                row.createCell(6).setCellValue(v.getStockMinimo());
            }

            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            throw new RuntimeException("Error al generar el archivo Excel de variantes", e);
        }
    }

    private String generarSku(Producto producto) {
        String prefijo = producto.getCategoria() != null ? producto.getCategoria().getCodigoPrefijo() : "GEN";
        String uuidCorto = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefijo + "-" + producto.getId() + "-" + uuidCorto;
    }

    private String generarCodigoBarrasUnico() {
        String codigoGenerado;
        do {
            StringBuilder sb = new StringBuilder("200");
            for (int i = 0; i < 9; i++) {
                sb.append((int) (Math.random() * 10));
            }
            String base12 = sb.toString();
            int checksum = calcularChecksumEAN13(base12);
            codigoGenerado = base12 + checksum;
        } while (varianteRepository.existsByCodigoBarras(codigoGenerado));

        return codigoGenerado;
    }

    private int calcularChecksumEAN13(String base12) {
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(base12.charAt(i));
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int checksum = 10 - (sum % 10);
        return checksum == 10 ? 0 : checksum;
    }
}