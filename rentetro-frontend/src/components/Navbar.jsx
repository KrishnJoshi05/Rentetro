import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
const ROLE_HOME = { admin: '/admin', renter: '/renter/listings', consumer: '/my-bookings' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();

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
              <span style={{ color: 'var(--ink-500)' }}>{user.name} · {user.role}</span>
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
