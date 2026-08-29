import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const STAT_CARDS = [
  { key: 'activeRentals', label: 'Active rentals' },
  { key: 'openDisputes', label: 'Open disputes' },
  { key: 'totalUsers', label: 'Total users' },
  { key: 'totalListings', label: 'Approved listings' },
  { key: 'totalRentRevenue', label: 'Rent revenue', prefix: '₹' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Admin overview</h1>

      <div className="grid-cards" style={{ marginBottom: 32 }}>
        {STAT_CARDS.map((s) => (
          <div key={s.key} className="card">
            <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              {stats ? `${s.prefix || ''}${stats[s.key]}` : '—'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin/listings" className="btn btn-primary">Review pending listings</Link>
        <Link to="/admin/disputes" className="btn btn-rust">Resolve disputes</Link>
        <Link to="/admin/users" className="btn btn-ghost">Manage users</Link>
      </div>
    </div>
  );
}
