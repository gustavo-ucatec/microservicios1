# Proyecto Base — Biblioteca Online (esqueleto)

Punto de partida para el proyecto en equipo. Reproduce la misma arquitectura
del proyecto de referencia (React + Gateway + Eureka + 2 microservicios),
pero con la lógica de negocio vacía: vuestro trabajo en los sprints es
completar los `TODO` que hay en el código.

## Arquitectura

```
        React (frontend, :5173)
                 │  HTTP
                 ▼
        Gateway (Spring Cloud Gateway, :8080)
                 │  se registra y descubre servicios en...
                 ▼
        Eureka (servidor de registro, :8761)
                 ▲                    ▲
                 │ se registran       │
     ms-operador (:8081) ── HTTP sin IP/puerto, por nombre Eureka ──► ms-buscador (:8082)
     (préstamos, H2)                                                 (catálogo de libros, H2)
```

- **eureka-server**: servidor de registro. Completo, no requiere cambios.
- **gateway**: único punto de entrada para el front-end. Ya trae las rutas
  `/api/libros/**` → `ms-buscador` y `/api/prestamos/**` → `ms-operador`.
  Completo, no requiere cambios.
- **ms-buscador**: catálogo de libros. Entidad `Libro`, DTOs y arranque
  listos; el controlador (`LibroController`) y el repositorio
  (`LibroRepository`) tienen los `TODO` de la búsqueda con filtros, alta y
  actualización de disponibilidad.
- **ms-operador**: gestión de préstamos. Entidad `Prestamo`, controlador,
  DTOs y configuración del `RestTemplate` listos; la lógica de negocio
  (`PrestamoService`) está por implementar: crear préstamo, devolverlo y
  comunicarse con `ms-buscador` por su nombre de registro en Eureka
  (nunca por IP:puerto).
- **frontend**: React + Vite mínimo. Solo tiene una página de bienvenida;
  hay que construir las pantallas de libros y préstamos consumiendo el
  Gateway a través de `/api/...` (ver `src/api/config.js`), nunca los
  microservicios directamente.

## Cómo ejecutarlo

Requisitos: Java 17+, Maven, Node.js 18+.

Arrancar en este orden (cada uno en su propia terminal):

```bash
# 1. Registro de servicios
cd eureka-server && mvn spring-boot:run

# 2. Microservicios (pueden arrancar en cualquier orden entre sí, pero después de Eureka)
cd ms-buscador && mvn spring-boot:run
cd ms-operador && mvn spring-boot:run

# 3. Gateway (después de que los microservicios estén registrados)
cd gateway && mvn spring-boot:run

# 4. Frontend
cd frontend
npm install
npm start
```

- Panel de Eureka: http://localhost:8761
- Front-End: http://localhost:5173
- Gateway (API): http://localhost:8080/api

## Qué falta por implementar (backlog técnico de partida)

- `ms-buscador`
  - `LibroRepository`: consulta de búsqueda por título/autor/año/disponibilidad
    (todos los filtros opcionales).
  - `LibroController`: listar/buscar, obtener por id, crear y actualizar
    disponibilidad.
- `ms-operador`
  - `PrestamoService#crear`: validar disponibilidad contra `ms-buscador`,
    guardar el préstamo y marcar el libro como no disponible.
  - `PrestamoService#devolver`: marcar el préstamo como devuelto y avisar a
    `ms-buscador` de que el libro vuelve a estar disponible.
- `frontend`
  - Pantallas de listado/detalle de libros y de alta/listado de préstamos.

Esto es un punto de partida razonable para dividir el trabajo en historias
de usuario y sprints; adaptad el alcance a las decisiones de vuestro equipo.
