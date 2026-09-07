import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

export const FormularioPrestamo = ({ onPrestamoCreado }) => {
  const [libros, setLibros] = useState([]);
  const [libroId, setLibroId] = useState('');
  const [usuario, setUsuario] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/libros`)
      .then((res) => res.json())
      .then((data) => {
 
        const disponibles = data.filter((libro) => libro.disponible);
        setLibros(disponibles);
      })
      .catch(() => setError('Error al cargar la lista de libros'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!libroId || !usuario) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/prestamos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroId: Number(libroId),
          usuario: usuario
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo procesar el préstamo');
      }

      setMensaje('¡Préstamo registrado con éxito!');
      setLibroId('');
      setUsuario('');
      
 
      setLibros(libros.filter((l) => l.id !== Number(libroId)));

      if (onPrestamoCreado) onPrestamoCreado();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', textAlign: 'left' }}>
      <h2>Registrar Nuevo Préstamo</h2>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block' }}>Nombre/ID del Usuario:</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Ej. Manuel Canedo"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block' }}>Seleccionar Libro:</label>
          <select
            value={libroId}
            onChange={(e) => setLibroId(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Selecciona un libro --</option>
            {libros.map((libro) => (
              <option key={libro.id} value={libro.id}>
                {libro.titulo} - {libro.autor}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
          Confirmar Préstamo
        </button>
      </form>
    </div>
  );
};