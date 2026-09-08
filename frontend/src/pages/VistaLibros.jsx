import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../api/config';

const initialFilters = { titulo: '', autor: '', anio: '', disponible: '' };
const localBooks = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anioPublicacion: 1967, isbn: '9780307474728', sinopsis: 'La saga de la familia Buendía en el pueblo de Macondo.', disponible: true },
  { id: 2, titulo: '1984', autor: 'George Orwell', anioPublicacion: 1949, isbn: '9780451524935', sinopsis: 'Una distopía sobre la vigilancia total del Estado.', disponible: true },
  { id: 3, titulo: 'El nombre del viento', autor: 'Patrick Rothfuss', anioPublicacion: 2007, isbn: '9780756404741', sinopsis: 'La historia de Kvothe, mago y músico legendario.', disponible: true },
  { id: 4, titulo: 'Fundación', autor: 'Isaac Asimov', anioPublicacion: 1951, isbn: '9780553293357', sinopsis: 'El declive y renacimiento de un imperio galáctico.', disponible: true },
  { id: 5, titulo: 'Rayuela', autor: 'Julio Cortázar', anioPublicacion: 1963, isbn: '9788437604572', sinopsis: 'Novela experimental que puede leerse en varios órdenes.', disponible: true },
  { id: 6, titulo: 'El Hobbit', autor: 'J.R.R. Tolkien', anioPublicacion: 1937, isbn: '9780547928227', sinopsis: 'Bilbo Bolsón emprende una aventura inesperada.', disponible: true },
  { id: 7, titulo: 'Sapiens', autor: 'Yuval Noah Harari', anioPublicacion: 2011, isbn: '9780062316097', sinopsis: 'Una breve historia de la humanidad.', disponible: true },
  { id: 8, titulo: 'Crónica de una muerte anunciada', autor: 'Gabriel García Márquez', anioPublicacion: 1981, isbn: '9780307389684', sinopsis: 'La crónica de un asesinato anunciado en un pueblo.', disponible: true },
];

function paramsFor(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== '') params.set(key, value); });
  return params;
}

function filterLocalBooks(filters) {
  const includesText = (text, value) => text.toLocaleLowerCase().includes(value.toLocaleLowerCase());
  return localBooks.filter((book) =>
    (!filters.titulo || includesText(book.titulo, filters.titulo))
    && (!filters.autor || includesText(book.autor, filters.autor))
    && (!filters.anio || String(book.anioPublicacion) === filters.anio)
    && (!filters.disponible || String(book.disponible) === filters.disponible),
  );
}

function BookCard({ book }) {
  const isAvailable = book.disponible === true;
  const initials = (book.titulo || 'Libro').slice(0, 2).toUpperCase();
  return <article className="book-card">
    <div className="book-cover" aria-hidden="true"><span>{initials}</span></div>
    <div className="book-content">
      <div className="book-card-topline"><span className={isAvailable ? 'availability available' : 'availability unavailable'}>{isAvailable ? 'Disponible' : 'Prestado'}</span>{book.anioPublicacion && <span className="book-year">{book.anioPublicacion}</span>}</div>
      <h2>{book.titulo}</h2><p className="book-author">{book.autor}</p><p className="book-synopsis">{book.sinopsis || 'Sin sinopsis disponible.'}</p>{book.isbn && <p className="book-isbn">ISBN {book.isbn}</p>}
    </div>
  </article>;
}

export default function VistaLibros() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadBooks() {
      setLoading(true); setError('');
      try {
        const params = paramsFor(appliedFilters);
        const response = await fetch(`${API_BASE_URL}/libros${params.size ? `?${params}` : ''}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setBooks(filterLocalBooks(appliedFilters));
          setError('No fue posible conectar con ms-buscador; se muestra el catálogo local para la vista previa.');
        }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    loadBooks();
    return () => controller.abort();
  }, [appliedFilters]);

  const activeFilters = useMemo(() => Object.values(appliedFilters).filter((value) => value !== '').length, [appliedFilters]);
  const handleChange = ({ target: { name, value } }) => setFilters((current) => ({ ...current, [name]: value }));
  const search = (event) => { event.preventDefault(); setAppliedFilters(filters); };
  const clear = () => { setFilters(initialFilters); setAppliedFilters(initialFilters); };

  return <section className="catalog-page" aria-labelledby="catalog-title">
    <div className="catalog-heading"><div><p className="eyebrow">Biblioteca online</p><h1 id="catalog-title">Explora el catálogo</h1><p className="catalog-intro">Encuentra tu próxima lectura entre los libros de nuestra biblioteca.</p></div><div className="catalog-count" aria-live="polite"><strong>{loading ? '…' : books.length}</strong><span>{books.length === 1 ? 'libro encontrado' : 'libros encontrados'}</span></div></div>
    <form className="book-search" onSubmit={search}>
      <div className="filter-field"><label htmlFor="titulo">Título</label><input id="titulo" name="titulo" value={filters.titulo} onChange={handleChange} placeholder="Ej. Cien años de soledad" /></div>
      <div className="filter-field"><label htmlFor="autor">Autor</label><input id="autor" name="autor" value={filters.autor} onChange={handleChange} placeholder="Nombre del autor" /></div>
      <div className="filter-field"><label htmlFor="anio">Año</label><input id="anio" name="anio" value={filters.anio} onChange={handleChange} inputMode="numeric" pattern="[0-9]*" placeholder="2024" /></div>
      <div className="filter-field"><label htmlFor="disponible">Disponibilidad</label><select id="disponible" name="disponible" value={filters.disponible} onChange={handleChange}><option value="">Todos</option><option value="true">Disponibles</option><option value="false">Prestados</option></select></div>
      <div className="filter-actions"><button className="button button-primary" type="submit">Buscar</button>{activeFilters > 0 && <button className="button button-secondary" type="button" onClick={clear}>Limpiar</button>}</div>
    </form>
    {loading && <div className="catalog-message">Cargando catálogo…</div>}
    {!loading && error && <div className="catalog-message catalog-message-info" role="status">{error}</div>}
    {!loading && books.length === 0 && <div className="catalog-message">No encontramos libros con esos filtros. Prueba a ampliar tu búsqueda.</div>}
    {!loading && books.length > 0 && <div className="book-grid">{books.map((book) => <BookCard book={book} key={book.id} />)}</div>}
  </section>;
}
