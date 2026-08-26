package com.unir.buscador.repository;

import com.unir.buscador.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibroRepository extends JpaRepository<Libro, Long> {

    // TODO: añadir aquí la consulta de búsqueda por título/autor/año/disponibilidad
    // (todos los filtros opcionales) que usará LibroController#buscar.
}
