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
import java.util.NoSuchElementException;

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

        return guardado;
    }

    public Prestamo devolver(Long id) {
        // 1. Buscar el préstamo (o lanzar NoSuchElementException si no existe)
        Prestamo prestamo = prestamoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Préstamo no encontrado"));

        // 2. Marcarlo como DEVUELTO con fechaDevolucion = hoy y guardarlo
        prestamo.setEstado("DEVUELTO");
        prestamo.setFechaDevolucion(LocalDate.now());
        Prestamo actualizado = prestamoRepository.save(prestamo);

        // 3. Avisar a ms-buscador de que el libro vuelve a estar disponible
        actualizarDisponibilidad(prestamo.getLibroId(), true);

        return actualizado;
    }

    private LibroDto obtenerLibro(Long libroId) {
        try {
            // GET a URL LIBRO. Eureka resuelve "ms-buscador"
            return restTemplate.getForObject("http://ms-buscador/libros/" + libroId, LibroDto.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new NoSuchElementException("Libro no encontrado en el catálogo");
        }
    }

    private void actualizarDisponibilidad(Long libroId, boolean disponible) {
        // Consumimos el endpoint PUT que creamos en LibroController
        String url = "http://ms-buscador/libros/" + libroId + "/disponibilidad?disponible=" + disponible;
        restTemplate.put(url, null);
    }
}