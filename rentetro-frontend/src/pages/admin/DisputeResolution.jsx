import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState({}); // disputeId -> { resolution, refundToConsumer, payoutToRenter }

  const load = () => {
    setLoading(true);
    api.get('/admin/disputes').then(({ data }) => setDisputes(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateForm = (id, field, value) => {
    setForms({ ...forms, [id]: { ...forms[id], [field]: value } });
  };

  const resolve = async (id) => {
    const f = forms[id] || {};
    if (!f.resolution?.trim()) return;

    await api.put(`/admin/disputes/${id}/resolve`, {
      resolution: f.resolution,
      refundToConsumer: Number(f.refundToConsumer) || 0,
      payoutToRenter: Number(f.payoutToRenter) || 0,
    });
    load();
  };

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Open disputes</h1>

      {disputes.length === 0 && (
        <div className="empty-state">
          <h3>No open disputes</h3>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {disputes.map((d) => {
          const deposit = d.booking?.depositAmount || 0;
          const f = forms[d._id] || {};
          return (
            <div key={d._id} className="card">
              <div style={{ marginBottom: 10 }}>
                <strong>{d.booking?.listing?.title || 'Booking'}</strong>
                <span style={{ fontSize: 13, color: 'var(--ink-500)' }}> · deposit held: ₹{deposit}</span>
              </div>
              <p style={{ fontSize: 14, marginBottom: 4 }}>
                <strong>Raised by:</strong> {d.raisedBy?.name} ({d.raisedBy?.email})
              </p>
              <p style={{ fontSize: 14, marginBottom: 14 }}><strong>Reason:</strong> {d.reason}</p>

              <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 14 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Refund to consumer (₹)</label>
                    <input
                      type="number"
                      min="0"
                      max={deposit}
                      value={f.refundToConsumer || ''}
                      onChange={(e) => updateForm(d._id, 'refundToConsumer', e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Payout to renter (₹)</label>
                    <input
                      type="number"
                      min="0"
                      max={deposit}
                      value={f.payoutToRenter || ''}
                      onChange={(e) => updateForm(d._id, 'payoutToRenter', e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Resolution notes</label>
                  <textarea
                    rows={2}
                    value={f.resolution || ''}
                    onChange={(e) => updateForm(d._id, 'resolution', e.target.value)}
                  />
                  {f.resolution === '' && <span className="error-text">Explain the decision</span>}
                </div>
                <button className="btn btn-primary" onClick={() => resolve(d._id)}>Resolve dispute</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
