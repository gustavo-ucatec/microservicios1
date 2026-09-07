package com.unir.operador.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unir.operador.model.Prestamo;
import com.unir.operador.service.PrestamoService;

// Expone /prestamos/{id} tal como lo define la tabla 4.2 del documento del
// proyecto. Se mantiene en un controlador separado de PrestamoController
// (que usa /libros/{id}/...) para no modificar rutas que ya están en main.
@RestController
@RequestMapping("/prestamos")
public class PrestamoQueryController {

    private final PrestamoService prestamoService;

    public PrestamoQueryController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestamo> obtenerPorId(@PathVariable Long id) {
        return prestamoService.obtener(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}