import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/listings/mine').then(({ data }) => setListings(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    load();
  };

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>My listings</h1>
        {user?.kycStatus !== 'verified' && (
  <div className="card" style={{ marginBottom: 16, borderColor: 'var(--rust-500)' }}>
    You need to <Link to="/verify-identity">verify your Aadhaar</Link> before you can publish listings.
  </div>
)}
        <Link to="/renter/listings/new" className="btn btn-primary">New listing</Link>
      </div>

      {listings.length === 0 && (
        <div className="empty-state">
          <h3>No listings yet</h3>
          <p>Create your first listing to start renting out items.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {listings.map((l) => (
          <div key={l._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>{l.title}</h3>
              <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                ₹{l.pricePerDay}/day · ₹{l.depositAmount} deposit
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={l.status} />
              <Link to={`/renter/listings/${l._id}/edit`} className="btn btn-ghost">Edit</Link>
              <button className="btn btn-ghost" onClick={() => remove(l._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
