import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EMPTY = { title: '', description: '', category: 'electronics', pricePerDay: '', depositAmount: '', images: [] };

export default function CreateEditListing() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [imageUrl, setImageUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/listings/${id}`).then(({ data }) => setForm(data));
    }
  }, [id, isEdit]);

  const valid = form.title && form.description && form.pricePerDay > 0 && form.depositAmount >= 0;

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, imageUrl.trim()] });
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/listings/${id}`, form);
      } else {
        await api.post('/listings', form);
      }
      navigate('/renter/listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save listing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell" style={{ paddingTop: 32, maxWidth: 520 }}>
      <h1>{isEdit ? 'Edit listing' : 'New listing'}</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {touched && !form.title && <span className="error-text">Enter a title</span>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {touched && !form.description && <span className="error-text">Enter a description</span>}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="vehicles">Vehicles</option>
            <option value="tools">Tools</option>
            <option value="outdoor">Outdoor &amp; sports</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="price">Price per day (₹)</label>
            <input
              id="price"
              type="number"
              min="0"
              value={form.pricePerDay}
              onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="deposit">Deposit amount (₹)</label>
            <input
              id="deposit"
              type="number"
              min="0"
              value={form.depositAmount}
              onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
            />
          </div>
        </div>
        {touched && !(form.pricePerDay > 0) && <span className="error-text">Enter a price above 0</span>}

        <div className="field">
          <label htmlFor="image">Image URL</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            <button type="button" className="btn btn-ghost" onClick={addImage}>Add</button>
          </div>
          {form.images.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 6 }}>{form.images.length} image(s) added</div>
          )}
        </div>

        {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create listing'}
        </button>
      </form>
    </div>
  );
}
