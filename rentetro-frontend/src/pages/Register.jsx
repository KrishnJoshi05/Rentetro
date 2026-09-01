import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name || !form.email || form.password.length < 6) return;

    try {
      await register(form);
      setSubmitted(true);
    } catch {
      // error already captured in auth context
    }
  };

  if (submitted) {
    return (
      <div className="app-shell" style={{ maxWidth: 420, paddingTop: 56 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Check your email</h2>
          <p style={{ color: 'var(--ink-500)', marginBottom: 16 }}>
            We sent a verification link to <strong>{form.email}</strong>. Click it to activate your
            account, then come back and log in.
          </p>
          <Link to="/login" className="btn btn-primary">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ maxWidth: 420, paddingTop: 56 }}>
      <h1>Create an account</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {touched && !form.name && <span className="error-text">Enter your name</span>}
        </div>
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
          {touched && form.password.length < 6 && (
            <span className="error-text">Password needs at least 6 characters</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="role">I want to</label>
          <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="consumer">Rent items from others</option>
            <option value="renter">List my own items for rent</option>
          </select>
        </div>
        {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p style={{ marginTop: 14, fontSize: 14, color: 'var(--ink-500)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}