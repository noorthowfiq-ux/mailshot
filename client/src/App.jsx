import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import Compose from './pages/Compose';
import History from './pages/History';
import Login from './pages/Login';

function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <header className="app-header">
        <div className="inner">
          <span className="brand">Mail<span className="dot">Shot</span></span>
          <nav className="nav">
            <NavLink to="/" end>Compose</NavLink>
            <NavLink to="/history">History</NavLink>
            <button className="btn-ghost" onClick={() => { logout(); navigate('/login'); }}>
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="page"><Outlet /></main>
    </>
  );
}

function RequireAuth({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Compose />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}