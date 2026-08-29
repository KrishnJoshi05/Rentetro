import { useEffect, useState } from 'react';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';

export default function ListingsBrowse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    api
      .get('/listings', { params, signal: controller.signal })
      .then(({ data }) => setListings(data.listings))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [search, category]);

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Browse listings</h1>

      <div className="card" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          placeholder="Search by name or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, border: '1px solid var(--ink-100)', borderRadius: 8, padding: '9px 12px' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ flex: 1, border: '1px solid var(--ink-100)', borderRadius: 8, padding: '9px 12px' }}
        >
          <option value="">All categories</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="vehicles">Vehicles</option>
          <option value="tools">Tools</option>
          <option value="outdoor">Outdoor &amp; sports</option>
        </select>
      </div>

      {loading && <p style={{ color: 'var(--ink-500)' }}>Loading listings…</p>}

      {!loading && listings.length === 0 && (
        <div className="empty-state">
          <h3>No listings match yet</h3>
          <p>Try a different search term or clear the category filter.</p>
        </div>
      )}

      <div className="grid-cards">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
