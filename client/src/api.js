const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

 
  if (res.status === 401 && !path.startsWith('/auth')) {
    localStorage.removeItem('token');
    window.location.assign('/login');
  }

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}