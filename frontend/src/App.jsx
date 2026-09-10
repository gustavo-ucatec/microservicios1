import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import VistaLibros from './pages/VistaLibros';
import VistaPrestamos from './pages/VistaPrestamos';
import FormularioPrestamo from './pages/FormularioPrestamo';
import './App.css';

function App() {
  return (
    <div>
      <nav>
        <ul style={{ display: 'flex', gap: '15px', listStyle: 'none' }}>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/libros">Libros</Link></li>
          <li><Link to="/prestamos">Préstamos</Link></li>
          <li><Link to="/nuevo-prestamo">Nuevo Préstamo</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/libros" element={<VistaLibros />} />
        <Route path="/prestamos" element={<VistaPrestamos />} />
        <Route path="/nuevo-prestamo" element={<FormularioPrestamo />} />
      </Routes>
    </div>
  );
}

export default App;