package com.unir.operador.service;

import com.unir.operador.dto.DisponibilidadRequest;
import com.unir.operador.dto.LibroDto;
import com.unir.operador.dto.NuevoPrestamoRequest;
import com.unir.operador.model.Prestamo;
import com.unir.operador.repository.PrestamoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class PrestamoService {

    // "ms-buscador" es el nombre con el que ese microservicio se registra en Eureka.
    // No usamos IP ni puerto: el LoadBalancer los resuelve a partir del registro.
    private static final String URL_LIBRO = "http://ms-buscador/libros/{id}";
    private static final String URL_DISPONIBILIDAD = "http://ms-buscador/libros/{id}/disponibilidad";

    private final PrestamoRepository prestamoRepository;
    private final RestTemplate restTemplate;

    public PrestamoService(PrestamoRepository prestamoRepository, RestTemplate restTemplate) {
        this.prestamoRepository = prestamoRepository;
        this.restTemplate = restTemplate;
    }

    public List<Prestamo> listar() {
        return prestamoRepository.findAll();
    }

    public Optional<Prestamo> obtener(Long id) {
        return prestamoRepository.findById(id);
    }

    public Prestamo crear(NuevoPrestamoRequest request) {
        // TODO:
        //  1. Consultar el libro en ms-buscador con obtenerLibro(request.getLibroId()).
        //  2. Si no está disponible, lanzar IllegalStateException.
        //  3. Guardar un nuevo Prestamo (estado ACTIVO, fechaPrestamo = hoy).
        //  4. Marcarlo como no disponible en ms-buscador con actualizarDisponibilidad.
        throw new UnsupportedOperationException("TODO: implementar creación de préstamo");
    }

    public Prestamo devolver(Long id) {
        // TODO:
        //  1. Buscar el préstamo (o lanzar NoSuchElementException si no existe).
        //  2. Marcarlo como DEVUELTO con fechaDevolucion = hoy y guardarlo.
        //  3. Avisar a ms-buscador de que el libro vuelve a estar disponible.
        throw new UnsupportedOperationException("TODO: implementar devolución de préstamo");
    }

    private LibroDto obtenerLibro(Long libroId) {
        // TODO: GET a URL_LIBRO. Traducir un 404 del buscador en NoSuchElementException.
        throw new UnsupportedOperationException("TODO: implementar");
    }

    private void actualizarDisponibilidad(Long libroId, boolean disponible) {
        // TODO: PUT a URL_DISPONIBILIDAD con un DisponibilidadRequest(disponible).
        throw new UnsupportedOperationException("TODO: implementar");
    }
}
