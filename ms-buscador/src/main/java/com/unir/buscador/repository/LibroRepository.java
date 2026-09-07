package com.unir.buscador.repository;

import com.unir.buscador.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {

    @Query("SELECT l FROM Libro l WHERE " +
        "(:titulo IS NULL OR LOWER(l.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))) AND " +
        "(:autor IS NULL OR LOWER(l.autor) LIKE LOWER(CONCAT('%', :autor, '%'))) AND " +
        "(:anioPublicacion IS NULL OR l.anioPublicacion = :anioPublicacion) AND " +
        "(:disponible IS NULL OR l.disponible = :disponible)")
    List<Libro> buscarConFiltros(@Param("titulo") String titulo,
                                @Param("autor") String autor,
                                @Param("anioPublicacion") Integer anioPublicacion,
                                @Param("disponible") Boolean disponible);
}