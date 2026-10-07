import { NavLink, Route, Routes } from 'react-router-dom';
import Compose from './pages/Compose';
import History from './pages/History';
export default function App() {
  return (
    <>
      <header className="app-header">
        <div className="inner">
          <span className="brand">Mail<span className="dot">Shot</span></span>
          <nav className="nav">
            <NavLink to="/" end>Compose</NavLink>
            <NavLink to="/history">History</NavLink>
          </nav>
        </div>
      </header>
      <main className="page">
        <Routes>
          <Route path="/" element={<Compose />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </>
  );
}