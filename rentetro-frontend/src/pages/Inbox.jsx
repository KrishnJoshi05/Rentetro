import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const when = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function Inbox() {
  const [chats, setChats] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get('/messages/conversations')
        .then(({ data }) => alive && setChats(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 10000); // refresh the inbox every 10s
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (!chats) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32, maxWidth: 720 }}>
      <h1>Messages</h1>

      {chats.length === 0 && (
        <div className="card" style={{ color: 'var(--ink-500)' }}>
          No conversations yet. Open a listing and tap “Message renter” to start one.
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {chats.map((c) => (
          <Link key={c.id} to={`/messages/${c.id}`} className="card" style={{ display: 'block', padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
              <strong>{c.otherName || 'User'}</strong>
              <span style={{ fontSize: 12, color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{when(c.lastMessageAt)}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--brass-600)', margin: '2px 0 6px' }}>
              Re: {c.listing?.title || 'Listing'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span
                style={{
                  color: c.unread ? 'var(--ink-900)' : 'var(--ink-500)',
                  fontWeight: c.unread ? 600 : 400,
                  fontSize: 14,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.lastMessage || 'No messages yet'}
              </span>
              {c.unread > 0 && (
                <span
                  style={{
                    background: 'var(--rust-500)',
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 20,
                    height: 20,
                    lineHeight: '20px',
                    textAlign: 'center',
                    padding: '0 6px',
                  }}
                >
                  {c.unread}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}