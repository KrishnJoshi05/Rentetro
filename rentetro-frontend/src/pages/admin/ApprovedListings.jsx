import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ApprovedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = () => {
    setLoading(true);
    api.get('/admin/listings/approved').then(({ data }) => setListings(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (listing) => {
    setEditId(listing._id);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      pricePerDay: listing.pricePerDay,
      depositAmount: listing.depositAmount,
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/listings/${id}/edit`, editForm);
      setEditId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit listing.');
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const pauseListing = async (id) => {
    try {
      await api.put(`/admin/listings/${id}/pause`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pause listing.');
    }
  };

  const unpauseListing = async (id) => {
    try {
      await api.put(`/admin/listings/${id}/unpause`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unpause listing.');
    }
  };

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Approved listings</h1>

      {listings.length === 0 && (
        <div className="empty-state">
          <h3>No approved listings</h3>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {listings.map((l) => (
          <div key={l._id} className="card">
            {editId === l._id ? (
              // Edit mode
              <div>
                <div className="field">
                  <label>Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ minHeight: 80 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="tools">Tools</option>
                      <option value="outdoor">Outdoor &amp; sports</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Price per day (₹)</label>
                    <input
                      type="number"
                      value={editForm.pricePerDay}
                      onChange={(e) => setEditForm({ ...editForm, pricePerDay: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Deposit amount (₹)</label>
                  <input
                    type="number"
                    value={editForm.depositAmount}
                    onChange={(e) => setEditForm({ ...editForm, depositAmount: Number(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-teal" onClick={() => saveEdit(l._id)}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              // View mode
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{l.title}</h3>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 6 }}>
                      by {l.renter?.name} ({l.renter?.email}) · ₹{l.pricePerDay}/day · ₹{l.depositAmount} deposit
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--brass-600)', marginBottom: 8, fontWeight: 600 }}>
                      {l.category.toUpperCase()} · Status: {l.status === 'paused' ? '⏸ Paused' : '✓ Active'}
                    </div>
                    <p style={{ fontSize: 14 }}>{l.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" onClick={() => startEdit(l._id)}>Edit</button>
                  {l.status === 'approved' && (
                    <button className="btn btn-brass" onClick={() => pauseListing(l._id)}>Pause</button>
                  )}
                  {l.status === 'paused' && (
                    <button className="btn btn-teal" onClick={() => unpauseListing(l._id)}>Unpause</button>
                  )}
                  <button className="btn btn-rust" onClick={() => deleteListing(l._id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
