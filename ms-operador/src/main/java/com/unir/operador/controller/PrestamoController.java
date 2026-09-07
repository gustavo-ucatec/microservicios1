package com.unir.operador.controller;

import com.unir.operador.dto.NuevoPrestamoRequest;
import com.unir.operador.model.Prestamo;
import com.unir.operador.repository.PrestamoRepository;
import com.unir.operador.service.PrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PrestamoController {

    @Autowired
    private PrestamoService prestamoService;

    @Autowired
    private PrestamoRepository prestamoRepository;

    // Crear un préstamo
    @PostMapping("/prestamos")
    public ResponseEntity<Prestamo> crearPrestamo(@RequestBody NuevoPrestamoRequest request) {
        Prestamo prestamo = prestamoService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(prestamo);
    }

    // Listar todos los préstamos
    @GetMapping("/prestamos")
    public ResponseEntity<List<Prestamo>> listarPrestamos() {
        List<Prestamo> prestamos = prestamoRepository.findAll();
        return ResponseEntity.ok(prestamos);
    }

    // Devolver un préstamo
    @PutMapping("/prestamos/{id}/devolucion")
    public ResponseEntity<Prestamo> devolverPrestamo(@PathVariable Long id) {
        Prestamo prestamo = prestamoService.devolver(id);
        return ResponseEntity.ok(prestamo);
    }
}