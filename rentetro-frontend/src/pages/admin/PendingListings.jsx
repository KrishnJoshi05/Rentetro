import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function PendingListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/listings/pending').then(({ data }) => setListings(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (id) => {
    await api.put(`/admin/listings/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    if (!reason.trim()) return;
    await api.put(`/admin/listings/${id}/reject`, { reason });
    setRejectId(null);
    setReason('');
    load();
  };

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Pending listings</h1>

      {listings.length === 0 && (
        <div className="empty-state">
          <h3>Nothing waiting for review</h3>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {listings.map((l) => (
          <div key={l._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{l.title}</h3>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 6 }}>
                  by {l.renter?.name} ({l.renter?.email}) · ₹{l.pricePerDay}/day · ₹{l.depositAmount} deposit
                </div>
                <p style={{ fontSize: 14 }}>{l.description}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-teal" onClick={() => approve(l._id)}>Approve</button>
                <button className="btn btn-rust" onClick={() => setRejectId(rejectId === l._id ? null : l._id)}>Reject</button>
              </div>
            </div>

            {rejectId === l._id && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--ink-100)', paddingTop: 12, display: 'flex', gap: 8 }}>
                <input
                  placeholder="Reason for rejection"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ flex: 1, border: '1px solid var(--ink-100)', borderRadius: 8, padding: '8px 12px' }}
                />
                <button className="btn btn-rust" onClick={() => reject(l._id)}>Confirm reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
