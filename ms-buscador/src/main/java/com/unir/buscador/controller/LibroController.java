package com.unir.buscador.controller;

import com.unir.buscador.dto.DisponibilidadRequest;
import com.unir.buscador.model.Libro;
import com.unir.buscador.repository.LibroRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/libros")
public class LibroController {

    private final LibroRepository libroRepository;

    public LibroController(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    @GetMapping
    public List<Libro> buscar(@RequestParam(required = false) String titulo,
                               @RequestParam(required = false) String autor,
                               @RequestParam(required = false) Integer anio,
                               @RequestParam(required = false) Boolean disponible) {
        return libroRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Libro> obtener(@PathVariable Long id) {
        // TODO: devolver el libro si existe, o 404 si no.
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @PostMapping
    public ResponseEntity<Libro> crear(@RequestBody Libro libro,
                                        UriComponentsBuilder uriBuilder) {
        if (libro.getTitulo() == null || libro.getTitulo().isBlank()
                || libro.getAutor() == null || libro.getAutor().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        libro.setId(null);

        Libro guardado = libroRepository.save(libro);

        URI location = uriBuilder
                .path("/libros/{id}")
                .buildAndExpand(guardado.getId())
                .toUri();

        return ResponseEntity.created(location).body(guardado);
    }

    @PutMapping("/{id}/disponibilidad")
    public ResponseEntity<Libro> actualizarDisponibilidad(@PathVariable Long id,
                                                           @RequestBody DisponibilidadRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}