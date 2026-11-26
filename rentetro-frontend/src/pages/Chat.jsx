import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const time = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function Chat() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const seenCount = useRef(0);

  const load = useCallback(
    () =>
      api
        .get(`/messages/conversations/${id}`)
        .then(({ data }) => setChat(data))
        .catch((err) => {
          if (err.response?.status === 404) setError('This conversation does not exist or you do not have access to it.');
        }),
    [id]
  );

  useEffect(() => {
    load();
    const timer = setInterval(load, 4000); // poll for new messages every 4s
    return () => clearInterval(timer);
  }, [load]);

  // Scroll down only when there are new messages
  useEffect(() => {
    if (chat && chat.messages.length !== seenCount.current) {
      seenCount.current = chat.messages.length;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      await api.post(`/messages/conversations/${id}/messages`, { text: body });
      setText('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the message.');
    } finally {
      setSending(false);
    }
  };

  if (error && !chat) {
    return (
      <div className="app-shell" style={{ paddingTop: 32 }}>
        <div className="error-text">{error}</div>
        <Link to="/messages">← Back to messages</Link>
      </div>
    );
  }
  if (!chat) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 24, maxWidth: 720 }}>
      <Link to="/messages" style={{ fontSize: 14 }}>← All messages</Link>
      <h2 style={{ margin: '8px 0 0' }}>{chat.otherName || 'User'}</h2>
      <div style={{ fontSize: 13, color: 'var(--brass-600)', marginBottom: 14 }}>
        Re: {chat.listing ? <Link to={`/listings/${chat.listing._id}`}>{chat.listing.title}</Link> : 'Listing'}
      </div>

      <div
        className="card"
        style={{ height: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}
      >
        {chat.messages.length === 0 && (
          <div style={{ color: 'var(--ink-500)', textAlign: 'center', marginTop: 20 }}>
            Say hello 👋 Ask about availability, pickup or condition.
          </div>
        )}

        {chat.messages.map((m) => (
          <div key={m._id} style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
            <div
              style={{
                background: m.mine ? 'var(--teal-500)' : 'var(--ink-100)',
                color: m.mine ? 'var(--paper)' : 'var(--ink-900)',
                padding: '8px 12px',
                borderRadius: 14,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 14,
              }}
            >
              {m.text}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2, textAlign: m.mine ? 'right' : 'left' }}>
              {time(m.createdAt)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}

      <form onSubmit={send} style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
          style={{ flex: 1 }}
        />
        <button className="btn btn-brass" type="submit" disabled={sending || !text.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}