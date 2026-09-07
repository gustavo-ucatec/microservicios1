import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import VistaLibros from './pages/VistaLibros';
import VistaPrestamos from './pages/VistaPrestamos';
import FormularioPrestamo from './pages/FormularioPrestamo';
import './App.css';

function App() {
  return (
    <>
      <header>
        <nav>
          <ul style={{ display: 'flex', gap: '15px', listStyle: 'none', padding: 0 }}>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/libros">Libros</Link></li>
            <li><Link to="/prestamos">Préstamos</Link></li>
            <li><Link to="/prestar">Prestar Libro</Link></li>
          </ul>
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/libros" element={<VistaLibros />} />
          <Route path="/prestamos" element={<VistaPrestamos />} />
          <Route path="/prestar" element={<FormularioPrestamo />} />
        </Routes>
      </main>
    </>
  );
}

export default App;