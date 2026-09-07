package com.unir.operador.service;

import com.unir.operador.dto.LibroDto;
import com.unir.operador.dto.NuevoPrestamoRequest;
import com.unir.operador.model.Prestamo;
import com.unir.operador.repository.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class PrestamoService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private RestTemplate restTemplate;

    public Prestamo crear(NuevoPrestamoRequest request) {
        // 1. Consultar el libro en ms-buscador
        LibroDto libro = obtenerLibro(request.getLibroId());
        
        // 2. Si no está disponible, lanzar IllegalStateException
        if (libro == null || !libro.isDisponible()) {
            throw new IllegalStateException("El libro no existe o no está disponible para préstamo");
        }

        // 3. Guardar un nuevo Prestamo (estado ACTIVO, fechaPrestamo = hoy)
        Prestamo prestamo = new Prestamo();
        prestamo.setLibroId(request.getLibroId());
        
        // Se usa setUsuario basándose en la entidad Prestamo.java
        prestamo.setUsuario(request.getUsuario()); 
        
        prestamo.setFechaPrestamo(LocalDate.now());
        
        // Se usa setEstado basándose en la entidad Prestamo.java
        prestamo.setEstado("ACTIVO");
        
        Prestamo guardado = prestamoRepository.save(prestamo);

        // 4. Marcarlo como no disponible en ms-buscador
        actualizarDisponibilidad(request.getLibroId(), false);

    public Prestamo crear(NuevoPrestamoRequest request) {
        LibroDto libro = obtenerLibro(request.getLibroId());

        if (!libro.isDisponible()) {
            throw new IllegalStateException("El libro ya esta prestado: " + request.getLibroId());
        }

        Prestamo prestamo = new Prestamo();
        prestamo.setLibroId(libro.getId());
        prestamo.setTituloLibro(libro.getTitulo());
        prestamo.setUsuario(request.getUsuario());
        prestamo.setFechaPrestamo(LocalDate.now());
        prestamo.setEstado("ACTIVO");

        Prestamo guardado = prestamoRepository.save(prestamo);
        actualizarDisponibilidad(libro.getId(), false);
        return guardado;
    }

    public Prestamo devolver(Long id) {
        Prestamo prestamo = prestamoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Préstamo no encontrado: " + id));

        prestamo.setEstado("DEVUELTO");
        prestamo.setFechaDevolucion(LocalDate.now());
        Prestamo guardado = prestamoRepository.save(prestamo);

        actualizarDisponibilidad(guardado.getLibroId(), true);
        return guardado;
    }

    @SuppressWarnings("unused")
    private LibroDto obtenerLibro(Long libroId) {
        try {
            LibroDto libro = restTemplate.getForObject(URL_LIBRO, LibroDto.class, libroId);
            if (libro == null) {
                throw new NoSuchElementException("Libro no encontrado: " + libroId);
            }
            return libro;
        } catch (HttpClientErrorException.NotFound ex) {
            throw new NoSuchElementException("Libro no encontrado: " + libroId);
        }
    }

    private void actualizarDisponibilidad(Long libroId, boolean disponible) {
        restTemplate.put(URL_DISPONIBILIDAD, new DisponibilidadRequest(disponible), libroId);
    }
}