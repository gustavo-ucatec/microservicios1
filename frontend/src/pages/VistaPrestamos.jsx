import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../api/config';

const initialFilters = { libro: '', usuario: '', fechaPrestamo: '', estado: '' };

const localLoans = [
  { id: 'local-1', libroId: 1, tituloLibro: 'Cien años de soledad', usuario: 'Sofía Rojas', fechaPrestamo: '2026-09-01', fechaLimiteDevolucion: '2099-09-15', estado: 'ACTIVO' },
  { id: 'local-2', libroId: 2, tituloLibro: '1984', usuario: 'Mateo Vargas', fechaPrestamo: '2026-08-04', fechaLimiteDevolucion: '2026-08-18', estado: 'VENCIDO' },
  { id: 'local-3', libroId: 3, tituloLibro: 'El nombre del viento', usuario: 'Valentina Cruz', fechaPrestamo: '2026-08-10', fechaLimiteDevolucion: '2026-08-24', estado: 'DEVUELTO' },
  { id: 'local-4', libroId: 4, tituloLibro: 'Fundación', usuario: 'Diego Flores', fechaPrestamo: '2026-09-03', fechaLimiteDevolucion: '2099-09-17', estado: 'ACTIVO' },
  { id: 'local-5', libroId: 5, tituloLibro: 'Rayuela', usuario: 'Camila Núñez', fechaPrestamo: '2026-07-21', fechaLimiteDevolucion: '2026-08-04', estado: 'VENCIDO' },
  { id: 'local-6', libroId: 6, tituloLibro: 'El Hobbit', usuario: 'Andrés Molina', fechaPrestamo: '2026-08-12', fechaLimiteDevolucion: '2026-08-26', estado: 'DEVUELTO' },
];

const DEFAULT_LOAN_DAYS = 14;

function paramsFor(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '') params.set(key, value);
  });
  return params;
}

function normalizedText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();
}

function dateKey(value) {
  const match = String(value ?? '').match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function addDays(date, days) {
  const value = dateKey(date);
  if (!value) return '';

  const [year, month, day] = value.split('-').map(Number);
  const result = new Date(year, month - 1, day + days);
  return [result.getFullYear(), String(result.getMonth() + 1).padStart(2, '0'), String(result.getDate()).padStart(2, '0')].join('-');
}

function todayKey() {
  const today = new Date();
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
}

function deadlineFor(loan) {
  const explicitDeadline = loan.fechaLimiteDevolucion
    ?? loan.fechaVencimiento
    ?? loan.fechaLimite
    ?? loan.fechaDevolucionPrevista;

  return dateKey(explicitDeadline) || addDays(loan.fechaPrestamo, DEFAULT_LOAN_DAYS);
}

function statusFor(status, deadline) {
  const value = normalizedText(status);
  if (['devuelto', 'returned'].includes(value)) return 'devuelto';
  if (['vencido', 'overdue', 'atrasado'].includes(value)) return 'vencido';
  if (deadline && deadline < todayKey()) return 'vencido';
  return 'activo';
}

function normalizeLoan(loan) {
  const libroId = loan.libroId ?? loan.libro?.id ?? '';
  const fechaPrestamo = dateKey(loan.fechaPrestamo);
  const fechaLimiteDevolucion = deadlineFor({ ...loan, fechaPrestamo });
  const usuario = loan.usuario || loan.lector || 'Usuario no especificado';

  return {
    ...loan,
    id: loan.id ?? `${libroId || 'libro'}-${fechaPrestamo || 'sin-fecha'}-${usuario}`,
    libroId,
    tituloLibro: loan.tituloLibro || loan.titulo || loan.libro?.titulo || (libroId ? `Libro #${libroId}` : 'Libro sin título'),
    usuario,
    fechaPrestamo,
    fechaLimiteDevolucion,
    estado: statusFor(loan.estado, fechaLimiteDevolucion),
  };
}

function normalizeLoans(loans) {
  return loans.filter((loan) => loan && typeof loan === 'object').map(normalizeLoan);
}

function filterLoans(loans, filters) {
  const includesText = (text, value) => normalizedText(text).includes(normalizedText(value));

  return loans.filter((loan) =>
    (!filters.libro || includesText(loan.libroId, filters.libro) || includesText(loan.tituloLibro, filters.libro))
    && (!filters.usuario || includesText(loan.usuario, filters.usuario))
    && (!filters.fechaPrestamo || loan.fechaPrestamo === filters.fechaPrestamo)
    && (!filters.estado || loan.estado === filters.estado),
  );
}

function filterLocalLoans(filters) {
  return filterLoans(normalizeLoans(localLoans), filters);
}

function loansFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.prestamos)) return data.prestamos;
  if (Array.isArray(data?.content)) return data.content;
  throw new Error('La respuesta de préstamos no tiene un formato válido.');
}

function formatDate(value) {
  const date = dateKey(value);
  if (!date) return 'No disponible';

  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function LoanCard({ loan }) {
  const statusLabel = { activo: 'Activo', devuelto: 'Devuelto', vencido: 'Vencido' }[loan.estado];

  return <article className="loan-card">
    <div className="loan-card-header">
      <span className={`loan-status loan-status--${loan.estado}`}>{statusLabel}</span>
      {loan.libroId !== '' && <span className="loan-book-id">Libro #{loan.libroId}</span>}
    </div>
    <h2>{loan.tituloLibro}</h2>
    <dl className="loan-details">
      <div><dt>Usuario</dt><dd>{loan.usuario}</dd></div>
      <div><dt>Fecha de préstamo</dt><dd>{formatDate(loan.fechaPrestamo)}</dd></div>
      <div><dt>Fecha límite de devolución</dt><dd>{formatDate(loan.fechaLimiteDevolucion)}</dd></div>
    </dl>
  </article>;
}

export default function VistaPrestamos() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadLoans() {
      setLoading(true);
      setError('');

      try {
        const params = paramsFor(appliedFilters);
        const response = await fetch(`${API_BASE_URL}/prestamos${params.size ? `?${params}` : ''}`, { signal: controller.signal });
        if (!response.ok) throw new Error('No fue posible obtener los préstamos.');

        const data = await response.json();
        setLoans(normalizeLoans(loansFromResponse(data)));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setLoans(filterLocalLoans(appliedFilters));
          setError('No fue posible conectar con ms-operador o el Gateway; se muestra una vista previa local de préstamos.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadLoans();
    return () => controller.abort();
  }, [appliedFilters]);

  const visibleLoans = useMemo(() => filterLoans(loans, appliedFilters), [loans, appliedFilters]);
  const activeFilters = useMemo(() => Object.values(appliedFilters).filter((value) => value !== '').length, [appliedFilters]);
  const handleChange = ({ target: { name, value } }) => setFilters((current) => ({ ...current, [name]: value }));
  const search = (event) => { event.preventDefault(); setAppliedFilters(filters); };
  const clear = () => { setFilters(initialFilters); setAppliedFilters(initialFilters); };

  return <section className="loans-page" aria-labelledby="loans-title">
    <div className="loans-heading">
      <div>
        <p className="eyebrow">Biblioteca online</p>
        <h1 id="loans-title">Consulta los préstamos</h1>
        <p className="catalog-intro">Revisa el estado y las fechas de devolución de cada libro prestado.</p>
      </div>
      <div className="catalog-count" aria-live="polite">
        <strong>{loading ? '…' : visibleLoans.length}</strong>
        <span>{visibleLoans.length === 1 ? 'préstamo encontrado' : 'préstamos encontrados'}</span>
      </div>
    </div>

    <form className="loan-search" onSubmit={search}>
      <div className="filter-field">
        <label htmlFor="libro">Libro</label>
        <input id="libro" name="libro" value={filters.libro} onChange={handleChange} placeholder="ID o título del libro" />
      </div>
      <div className="filter-field">
        <label htmlFor="usuario">Usuario o lector</label>
        <input id="usuario" name="usuario" value={filters.usuario} onChange={handleChange} placeholder="Nombre del usuario" />
      </div>
      <div className="filter-field">
        <label htmlFor="fechaPrestamo">Fecha de préstamo</label>
        <input id="fechaPrestamo" name="fechaPrestamo" type="date" value={filters.fechaPrestamo} onChange={handleChange} />
      </div>
      <div className="filter-field">
        <label htmlFor="estado">Estado</label>
        <select id="estado" name="estado" value={filters.estado} onChange={handleChange}>
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="devuelto">Devueltos</option>
          <option value="vencido">Vencidos</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="button button-primary" type="submit">Buscar</button>
        {activeFilters > 0 && <button className="button button-secondary" type="button" onClick={clear}>Limpiar</button>}
      </div>
    </form>

    {loading && <div className="catalog-message" role="status">Cargando préstamos…</div>}
    {!loading && error && <div className="catalog-message catalog-message-info" role="status">{error}</div>}
    {!loading && visibleLoans.length === 0 && <div className="catalog-message">No encontramos préstamos con esos filtros. Prueba a ampliar tu búsqueda.</div>}
    {!loading && visibleLoans.length > 0 && <div className="loan-grid">{visibleLoans.map((loan) => <LoanCard loan={loan} key={loan.id} />)}</div>}
  </section>;
}
