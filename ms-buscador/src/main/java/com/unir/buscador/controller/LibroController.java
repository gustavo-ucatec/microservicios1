package com.unir.buscador.controller;

import com.unir.buscador.model.Libro;
import com.unir.buscador.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LibroController {

    @Autowired
    private LibroRepository libroRepository;

    // 1. Listar y Buscar con filtros
    @GetMapping("/libros")
    public ResponseEntity<List<Libro>> listarLibros(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor,
            @RequestParam(required = false) Integer anioPublicacion,
            @RequestParam(required = false) Boolean disponible) {

        List<Libro> libros = libroRepository.buscarConFiltros(titulo, autor, anioPublicacion, disponible);
        return ResponseEntity.ok(libros);
    }

    // 2. Obtener por ID
    @GetMapping("/libros/{id}")
    public ResponseEntity<Libro> obtenerLibro(@PathVariable Long id) {
        return libroRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Crear libro
    @PostMapping("/libros")
    public ResponseEntity<Libro> crearLibro(@RequestBody Libro libro) {
        // Por defecto, al crear un libro lo ponemos como disponible si no se especifica
        if (libro.isDisponible() == false) {
            libro.setDisponible(true); 
        }
        Libro guardado = libroRepository.save(libro);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // 4. Actualizar disponibilidad
    @PutMapping("/libros/{id}/disponibilidad")
    public ResponseEntity<Libro> actualizarDisponibilidad(
            @PathVariable Long id, 
            @RequestParam Boolean disponible) {
        
        return libroRepository.findById(id)
                .map(libro -> {
                    libro.setDisponible(disponible);
                    Libro actualizado = libroRepository.save(libro);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}