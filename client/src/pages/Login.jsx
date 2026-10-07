import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { email, password } });
      login(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card" onSubmit={submit}>
        <h1>Admin login</h1>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} autoFocus
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="actions">
          <button className="btn btn-primary" type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
