import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'furniture', label: 'Furniture' },
  { key: 'tools', label: 'Tools' },
  { key: 'outdoor', label: 'Outdoor & Camping' },
  { key: 'Music', label: 'Musical Instruments' },
];

const CATEGORY_VISUALS = {
  '': { background: 'url(https://media.licdn.com/dms/image/v2/D4E0BAQExotxnle9wfQ/company-logo_200_200/B4EZWVEhYMHgAI-/0/1741962745984?e=2147483647&v=beta&t=_UynpYtLTvTBTYQilK2hXEjvZZTHZqiSxeRUkuCcb4Q' },
  electronics: { background: 'url(https://www.eletimes.ai/wp-content/uploads/2024/12/digital_electronics.jpg) center/cover no-repeat'  },
  furniture: { background: 'url(https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=70) center/cover no-repeat' },
  tools: { background: 'url(https://www.dimolanka.com/wp-content/uploads/2022/11/Tools-and-Equipment-Indoor-1200x630-1.jpg?auto=format&fit=crop&w=400&q=70) center/cover no-repeat' },
  outdoor: { background: 'url(https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=70) center/cover no-repeat' },
  Music: { background: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMcbZkXEx9SPSpnqj_y8CPOE8fdRXFo95RdR1e9WteT64Thq29FHgvtog&s=10?auto=format&fit=crop&w=400&q=70) center/cover no-repeat' },
};

export default function LandingPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 6 };
    if (category) params.category = category;

    api
      .get('/listings', { params })
      .then(({ data }) => setListings(data.listings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      {/* Trust strip */}
      <div style={{ background: 'var(--ink-900)', color: 'var(--paper)', fontSize: 12.5, textAlign: 'center', padding: '7px 0' }}>
        No surprise charges &nbsp;·&nbsp; Deposit refunded automatically &nbsp;·&nbsp; Verified renters only
      </div>

      {/* Hero */}
      <div className="app-shell">
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 40,
            alignItems: 'center',
            padding: '64px 0 56px',
            borderBottom: '1px solid var(--ink-100)',
            marginBottom: 48,
          }}
        >
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brass-600)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Rent anything · Deposit protected
            </span>
            <h1 style={{ fontSize: 42, margin: '12px 0 16px' }}>
              Access over <em style={{ fontStyle: 'italic', color: 'var(--brass-600)' }}>Ownership.</em>
            </h1>
            <p style={{ color: 'var(--ink-500)', fontSize: 16, marginBottom: 26, maxWidth: 460 }}>
              Rentetro connects people who have things sitting idle with people who need them for a
              week, a month, or a season — with the security deposit held safely until the item
              comes back exactly as it left.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <Link to="/listings" className="btn btn-primary">Browse listings</Link>
              <Link to="/register" className="btn btn-ghost">List an item</Link>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--ink-500)' }}>
              <span>✓ No hidden charges</span>
              <span>✓ Quality checked</span>
              <span>✓ Flexible tenure</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                height: 300,
                borderRadius: 'var(--radius-lg)',
                background: 'url(/rr.jpeg) center/cover no-repeat',
                border: '1px solid var(--ink-100)',
              }}
            />
            <div
              className="card"
              style={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                maxWidth: 220,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 4 }}>Camping gear bundle</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>from ₹299/day</div>
              <div style={{ fontSize: 12, color: 'var(--brass-600)', fontWeight: 600 }}>Fully refundable deposit</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brass-600)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Curated listings
          </span>
          <h2 style={{ fontSize: 26, margin: '8px 0 20px' }}>Find what you need, from people nearby</h2>

          <div style={{ overflow: 'hidden', marginBottom: 28 }}>
            <div className="category-track">
              {[...CATEGORIES, ...CATEGORIES].map((c, i) => {
                const visual = CATEGORY_VISUALS[c.key];
                const active = category === c.key;
                return (
                  <button
                    key={`${c.key}-${i}`}
                    onClick={() => setCategory(c.key)}
                    className="btn"
                    style={{
                      width: 200,
                      height: 200,
                      marginRight: '10px',
                      flexShrink: 0,
                      borderRadius: 'var(--radius-lg)',
                      background: visual.background,
                      border: active ? '2px solid var(--brass-500)' : '1px solid var(--ink-100)',
                      position: 'relative',
                      color: '#fff',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55))',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    />
                    <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 13, fontWeight: 600 }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading && <p style={{ color: 'var(--ink-500)' }}>Loading listings…</p>}

          {!loading && listings.length === 0 && (
            <div className="empty-state">
              <h3>No listings yet in this category</h3>
              <p>Be the first to list an item.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: 12 }}>List an item</Link>
            </div>
          )}

          <div className="grid-cards">
            {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brass-600)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Renting, made simple
          </span>
          <h2 style={{ fontSize: 26, margin: '8px 0 24px' }}>Settle in without settling.</h2>

          <div className="grid-cards">
            {[
              { t: 'List or find', d: "Renters list an item with pricing and deposit. Consumers browse and request to book." },
              {  t: 'Deposit held', d: 'Rent is paid and the deposit is authorized — held, not charged — for the rental period.' },
              { t: 'Return & settle', d: 'Good condition means a full refund. Damage goes to admin review as a tie-breaker.' },
            ].map((step) => (
              <div key={step.n} className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-100)', fontWeight: 700, marginBottom: 6 }}>
                  {step.n}
                </div>
                <h3>{step.t}</h3>
                <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="card"
          style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--ink-900)', border: 'none', marginBottom: 56 }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brass-500)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Ready when you are
          </span>
          <h2 style={{ color: 'var(--paper)', fontSize: 28, margin: '10px 0 20px' }}>
            Stop buying things you'll use once.
          </h2>
          <Link to={user ? '/listings' : '/login'} className="btn btn-brass">Start renting</Link>
        </section>
      </div>

      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: '28px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}>Rentetro</div>
        <div style={{ marginBottom: 5 }}>Rent almost anything, deposit protected.</div>
        <div>© 2026 Rentetro.in</div>
      </footer>
    </div>
  );
}