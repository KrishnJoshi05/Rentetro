import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/bookings/mine').then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>My bookings</h1>

      {bookings.length === 0 && (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>Browse listings and request your first rental.</p>
          <Link to="/listings" className="btn btn-primary" style={{ marginTop: 12 }}>Browse listings</Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bookings.map((b) => (
          <Link
            key={b._id}
            to={`/my-bookings/${b._id}`}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <div>
              <h3 style={{ marginBottom: 4 }}>{b.listing?.title}</h3>
              <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · with {b.renter?.name}
              </div>
            </div>
            <StatusBadge status={b.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
