import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Compose() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);

 
  const parsed = useMemo(() => {
    const list = recipients.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    return [...new Set(list)];
  }, [recipients]);

  const valid = parsed.filter((e) => EMAIL_RE.test(e));
  const invalid = parsed.filter((e) => !EMAIL_RE.test(e));

  
  useEffect(() => {
    if (!campaign || campaign.status !== 'sending') return;
    const timer = setInterval(async () => {
      try {
        setCampaign(await api(`/campaigns/${campaign._id}`));
      } catch (err) {
        setError(err.message);
        clearInterval(timer);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [campaign?._id, campaign?.status]);

  async function send(e) {
    e.preventDefault();
    setError('');
    if (!subject.trim() || !body.trim()) return setError('Subject and body are required.');
    if (valid.length === 0) return setError('Add at least one valid recipient.');
    if (invalid.length > 0) return setError(`Fix these addresses: ${invalid.join(', ')}`);

    setSubmitting(true);
    try {
      const { id } = await api('/campaigns', {
        method: 'POST',
        body: { subject, body, recipients: valid },
      });
      setCampaign(await api(`/campaigns/${id}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubject(''); setBody(''); setRecipients(''); setCampaign(null); setError('');
  }

  return (
    <>
      <form className="card" onSubmit={send}>
        <h1>New campaign</h1>

        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input id="subject" type="text" maxLength={120} value={subject}
            onChange={(e) => setSubject(e.target.value)} placeholder="Q3 product update" />
        </div>

        <div className="field">
          <label htmlFor="recipients">Recipients</label>
          <textarea id="recipients" rows="4" value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder={'one address per line, or comma separated'} />
          <p className={invalid.length ? 'hint bad' : 'hint'}>
            {parsed.length === 0
              ? 'Paste as many addresses as you like — duplicates get removed.'
              : `${valid.length} valid` + (invalid.length ? `, ${invalid.length} invalid: ${invalid.join(', ')}` : '')}
          </p>
        </div>

        <div className="field">
          <label htmlFor="body">Message</label>
          <textarea id="body" rows="10" value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send(e); }}
            placeholder={'Hi everyone,\n\n...'} />
          <p className="hint">Ctrl + Enter sends</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={submitting || !!campaign}>
            {submitting ? 'Queueing…' : 'Send campaign'}
          </button>
        </div>
      </form>

      {campaign && <ProgressCard campaign={campaign} onReset={reset} />}
    </>
  );
}

function ProgressCard({ campaign, onReset }) {
  const sent = campaign.recipients.filter((r) => r.status === 'sent').length;
  const failed = campaign.recipients.filter((r) => r.status === 'failed').length;
  const total = campaign.totalCount || campaign.recipients.length;
  const pct = total ? Math.round(((sent + failed) / total) * 100) : 0;
  const done = campaign.status !== 'sending';
  const failures = campaign.recipients.filter((r) => r.status === 'failed');
  const previews = campaign.recipients.filter((r) => r.previewUrl);

  return (
    <div className="card">
      <h2>{done ? 'Finished' : 'Sending…'}</h2>
      <p className="hint">“{campaign.subject}”</p>

      <div className="bar"><span style={{ width: pct + '%' }} /></div>
      <p className="hint">
        {sent} sent · {failed} failed · {total - sent - failed} still queued
      </p>

      {done && (
        <>
          <p style={{ marginTop: 16 }}>
            Result: <span className={'badge ' + campaign.status}>{campaign.status}</span>
          </p>

          {failures.length > 0 && (
            <div className="failed-list">
              <h3>Failures</h3>
              <ul>{failures.map((r) => <li key={r.email}>{r.email} — {r.error}</li>)}</ul>
            </div>
          )}

          {previews.length > 0 && (
            <details>
              <summary style={{ marginTop: 12, cursor: 'pointer' }}>Open sent messages</summary>
              <ul className="recipient-list" style={{ marginTop: 8 }}>
                {previews.map((r) => (
                  <li key={r.email}>
                    <span className="email">{r.email}</span>
                    <a href={r.previewUrl} target="_blank" rel="noreferrer">view →</a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={onReset}>Write another</button>
          </div>
        </>
      )}
    </div>
  );
}