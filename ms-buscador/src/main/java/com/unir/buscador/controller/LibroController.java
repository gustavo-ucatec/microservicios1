package com.unir.buscador.controller;

import com.unir.buscador.dto.DisponibilidadRequest;
import com.unir.buscador.dto.NuevoLibroRequest;
import com.unir.buscador.model.Libro;
import com.unir.buscador.repository.LibroRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        // TODO: filtrar por los parámetros recibidos (todos opcionales).
        return libroRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Libro> obtener(@PathVariable Long id) {
        // TODO: devolver el libro si existe, o 404 si no.
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @PostMapping
    public ResponseEntity<Libro> crear(@Valid @RequestBody NuevoLibroRequest request) {
        Libro libro = new Libro();
        libro.setTitulo(request.getTitulo());
        libro.setAutor(request.getAutor());
        libro.setAnioPublicacion(request.getAnioPublicacion());
        libro.setIsbn(request.getIsbn());
        libro.setSinopsis(request.getSinopsis());
        libro.setDisponible(request.getDisponible());

        Libro creado = libroRepository.save(libro);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // ms-operador llama aquí para marcar un libro como prestado/devuelto. Es la
    // unica fuente de verdad sobre disponibilidad: evita que se preste dos veces.
    @PutMapping("/{id}/disponibilidad")
    public ResponseEntity<Libro> actualizarDisponibilidad(@PathVariable Long id,
                                                           @RequestBody DisponibilidadRequest request) {
        return libroRepository.findById(id)
                .map(libro -> {
                    libro.setDisponible(request.isDisponible());
                    return ResponseEntity.ok(libroRepository.save(libro));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
