import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = { admin: '/admin', renter: '/renter/listings', consumer: '/my-bookings' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: 'var(--ink-900)' }}>
          Rentora
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
          <Link to="/listings">Browse</Link>

          {!user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
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
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
