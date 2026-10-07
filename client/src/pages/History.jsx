import { useEffect, useState } from 'react';
import api from '../api';

export default function History() {
  const [campaigns, setCampaigns] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/campaigns').then(setCampaigns).catch((e) => setError(e.message));
  }, []);

  async function open(id) {
    setSelected(null);
    try {
      setSelected(await api(`/campaigns/${id}`));
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <div className="card"><div className="error-box">{error}</div></div>;
  if (!campaigns) return <p className="hint">Loading…</p>;
  if (campaigns.length === 0) return <div className="card">Nothing sent yet. Go write something.</div>;

  return (
    <>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th><th>To</th><th>Sent</th><th>Failed</th><th>Status</th><th>When</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c._id} className={selected && selected._id === c._id ? 'selected' : ''}
                onClick={() => open(c._id)}>
                <td>{c.subject}</td>
                <td>{c.totalCount}</td>
                <td>{c.sentCount}</td>
                <td>{c.failedCount}</td>
                <td><span className={'badge ' + c.status}>{c.status}</span></td>
                <td className="hint">{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card">
          <h2>{selected.subject}</h2>
          <p className="hint">{new Date(selected.createdAt).toLocaleString()} · click a row above to switch</p>
          <ul className="recipient-list">
            {selected.recipients.map((r) => (
              <li key={r.email}>
                <span className="email">{r.email}</span>
                <span className={'badge ' + r.status}>{r.status}</span>
                {r.previewUrl && <a href={r.previewUrl} target="_blank" rel="noreferrer">view →</a>}
                {r.error && <span className="hint bad">{r.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}