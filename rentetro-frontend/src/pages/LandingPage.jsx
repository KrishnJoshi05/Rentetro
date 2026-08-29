import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="app-shell">
      <section
        style={{
          padding: '72px 0 56px',
          borderBottom: '1px solid var(--ink-100)',
          marginBottom: 40,
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            Rent assests, secure Deposits, feel free to use.
          </span>
          <h1 style={{ fontSize: 40, marginTop: 10, marginBottom: 14 }}>
            Borrow what you need. List what you don't.
          </h1>
          <p style={{ color: 'var(--ink-500)', fontSize: 16, marginBottom: 24 }}>
            Every booking on Rentora holds the security deposit in escrow until the item comes back —
            so renters get protected, and consumers only pay for damage they actually caused.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/listings" className="btn btn-primary">Browse listings</Link>
            <Link to="/register" className="btn btn-ghost">List an item</Link>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        <div className="card">
          <h3>1. List or book</h3>
          <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>
            Renters list an item with a rental price and deposit amount. Consumers browse and request to book.
          </p>
        </div>
        <div className="card">
          <h3>2. Deposit held</h3>
          <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>
            The rent is paid and the deposit is authorized — held, not charged — for the length of the rental.
          </p>
        </div>
        <div className="card">
          <h3>3. Return &amp; settle</h3>
          <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>
            Good condition means a full deposit refund. Damage gets reviewed, with admin as the tie-breaker.
          </p>
        </div>
      </section>
    </div>
  );
}
