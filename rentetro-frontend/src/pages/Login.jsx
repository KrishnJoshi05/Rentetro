import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = { admin: '/admin', renter: '/renter/listings', consumer: '/my-bookings' };

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.email || !form.password) return;

    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch {
      // error already captured in auth context
    }
  };

  return (
    <div className="app-shell" style={{ maxWidth: 400, paddingTop: 56 }}>
      <h1>Log in</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {touched && !form.email && <span className="error-text">Enter your email</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {touched && !form.password && <span className="error-text">Enter your password</span>}
        </div>
        {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: 'auto' , marginLeft: 133 }}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: 14, marginLeft: 133, fontSize: 14, color: 'var(--ink-500)' }}>
        No account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}
