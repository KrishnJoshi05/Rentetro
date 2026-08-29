import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function IncomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [damageForm, setDamageForm] = useState(null); // booking id currently filling out damage report
  const [damage, setDamage] = useState({ description: '', deductionAmount: '' });

  const load = () => {
    setLoading(true);
    api.get('/bookings/mine').then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (bookingId, action, body) => {
    setBusyId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/${action}`, body);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const submitDamage = async (e, bookingId) => {
    e.preventDefault();
    if (!damage.description.trim()) return;
    await act(bookingId, 'flag-damage', {
      description: damage.description,
      deductionAmount: Number(damage.deductionAmount) || 0,
      evidenceUrls: [],
    });
    setDamageForm(null);
    setDamage({ description: '', deductionAmount: '' });
  };

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Incoming bookings</h1>

      {bookings.length === 0 && (
        <div className="empty-state">
          <h3>No booking requests yet</h3>
          <p>They'll show up here once a consumer books one of your listings.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bookings.map((b) => (
          <div key={b._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{b.listing?.title}</h3>
                <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                  {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · {b.consumer?.name}
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {b.status === 'pending' && (
                <button className="btn btn-primary" disabled={busyId === b._id} onClick={() => act(b._id, 'accept')}>
                  Accept booking
                </button>
              )}
              {b.status === 'paid' && (
                <button className="btn btn-brass" disabled={busyId === b._id} onClick={() => act(b._id, 'handover')}>
                  Confirm handover
                </button>
              )}
              {b.status === 'returned' && (
                <>
                  <button className="btn btn-teal" disabled={busyId === b._id} onClick={() => act(b._id, 'confirm-return')}>
                    Confirm good condition — refund deposit
                  </button>
                  <button className="btn btn-rust" onClick={() => setDamageForm(damageForm === b._id ? null : b._id)}>
                    Flag damage
                  </button>
                </>
              )}
            </div>

            {damageForm === b._id && (
              <form onSubmit={(e) => submitDamage(e, b._id)} style={{ marginTop: 14, borderTop: '1px solid var(--ink-100)', paddingTop: 14 }}>
                <div className="field">
                  <label htmlFor={`desc-${b._id}`}>What's damaged?</label>
                  <textarea
                    id={`desc-${b._id}`}
                    rows={2}
                    value={damage.description}
                    onChange={(e) => setDamage({ ...damage, description: e.target.value })}
                  />
                  {!damage.description.trim() && <span className="error-text">Describe the damage</span>}
                </div>
                <div className="field">
                  <label htmlFor={`deduct-${b._id}`}>Deduction amount (₹)</label>
                  <input
                    id={`deduct-${b._id}`}
                    type="number"
                    min="0"
                    max={b.depositAmount}
                    value={damage.deductionAmount}
                    onChange={(e) => setDamage({ ...damage, deductionAmount: e.target.value })}
                  />
                </div>
                <button className="btn btn-rust" type="submit" disabled={busyId === b._id}>Submit damage report</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
