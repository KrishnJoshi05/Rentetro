import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          height: 130,
          borderRadius: 8,
          background: listing.images?.[0] ? `url(${listing.images[0]}) center/cover` : 'var(--ink-100)',
          marginBottom: 12,
        }}
      />
      <h3 style={{ marginBottom: 4 }}>{listing.title}</h3>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 8 }}>{listing.category}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong>₹{listing.pricePerDay}/day</strong>
        <span style={{ fontSize: 12, color: 'var(--brass-600)' }}>₹{listing.depositAmount} deposit</span>
      </div>
      {listing.renter?.rating !== undefined && (
        <div style={{ marginTop: 8 }}>
          <RatingStars rating={listing.renter.rating} count={listing.renter.ratingCount} />
        </div>
      )}
    </Link>
  );
}
