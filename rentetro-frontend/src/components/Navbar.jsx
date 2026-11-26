import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
const ROLE_HOME = { admin: '/admin', renter: '/renter/listings', consumer: '/my-bookings' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
    // Unread-message badge (renters and consumers only)
  const [unread, setUnread] = useState(0);
  const canChat = !!user && (user.role === 'renter' || user.role === 'consumer');
  useEffect(() => {
    if (!canChat) {
      setUnread(0);
      return undefined;
    }
    let alive = true;
    const load = () =>
      api
        .get('/messages/unread-count')
        .then(({ data }) => alive && setUnread(data.unread))
        .catch(() => {});
    load();
    const timer = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [canChat]);

  return (
    <header
      style={{
        borderBottom: '1px solid var(--ink-100)',
        background: 'var(--paper-raised)',
      }}
    >
      <div
        className="app-shell"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}
      >
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--ink-900)' }}>
          Rentetro.in™
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
          <Link to="/listings">Browse</Link>

          {!user && (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Sign up</Link>
                      <button
         className="btn btn-primary"
         onClick={toggleTheme}
           aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
           style={{ padding: '6px 10px' }}
           >
          {mode === 'light' ? '🌙' : '☀️'}
          </button>
            </>
          )}

          {user && (
            <>
              <Link to={ROLE_HOME[user.role] || '/'}>Dashboard</Link>
              {user.role === 'renter' && <Link to="/renter/bookings">Bookings</Link>}
                            {canChat && (
                <Link to="/messages">
                  Messages
                  {unread > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        background: 'var(--rust-500)',
                        color: '#fff',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '1px 7px',
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </Link>
              )}
              <span style={{ color: 'var(--ink-500)' }}>{user.name} · {user.role}</span>
              {(user.role === 'renter' || user.role === 'consumer') &&
  (user.kycStatus === 'verified' ? (
    <span style={{ color: 'var(--teal-600)', fontSize: 12, fontWeight: 600 }}>✓ ID verified</span>
  ) : (
    <Link to="/verify-identity" style={{ color: 'var(--rust-600)', fontWeight: 600 }}>Verify ID</Link>
  ))}
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Sign out
              </button>
            </>

          )}
        </nav>
      </div>
    </header>
  );
}
