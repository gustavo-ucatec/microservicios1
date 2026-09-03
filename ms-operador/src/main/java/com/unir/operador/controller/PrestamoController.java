package com.unir.operador.controller;

import com.unir.operador.dto.NuevoPrestamoRequest;
import com.unir.operador.model.Prestamo;
import com.unir.operador.service.PrestamoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/libros/{id}")
public class PrestamoController {

    private final PrestamoService prestamoService;

    public PrestamoController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

     /*
     * Obtiene la información del préstamo asociado directamente al ID del libro.
     */
    @GetMapping
    public ResponseEntity<Prestamo> obtenerPorLibroId(@PathVariable("id") Long id) {
        return prestamoService.obtener(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestamo> obtener(@PathVariable Long id) {
        return prestamoService.obtener(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/prestamos")
    public ResponseEntity<?> crear(@PathVariable("id") Long id, @RequestBody NuevoPrestamoRequest request) {
        try {
            Prestamo creado = prestamoService.crear(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

     /*
     * Procesa la devolución del libro correspondiente al ID.
     */
    @PutMapping("/prestamos")
    public ResponseEntity<?> devolver(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(prestamoService.devolver(id));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}
