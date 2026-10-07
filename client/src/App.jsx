import { NavLink, Route, Routes } from 'react-router-dom';
import Compose from './pages/Compose';

export default function App() {
  return (
    <>
      <header className="app-header">
        <div className="inner">
          <span className="brand">Mail<span className="dot">Shot</span></span>
          <nav className="nav">
            <NavLink to="/" end>Compose</NavLink>
          </nav>
        </div>
      </header>
      <main className="page">
        <Routes>
          <Route path="/" element={<Compose />} />
        </Routes>
      </main>
    </>
  );
}