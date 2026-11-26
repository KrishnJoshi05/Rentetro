import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`).then(({ data }) => setListing(data));
  }, [id]);

  const days =
    dates.startDate && dates.endDate
      ? Math.max(1, Math.ceil((new Date(dates.endDate) - new Date(dates.startDate)) / 86400000))
      : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    setTouched(true);
    setMessage('');
    if (!dates.startDate || !dates.endDate || days < 1) return;

    if (!user) return navigate('/login');
    if (user.role !== 'consumer') {
      setMessage('Only consumer accounts can book a rental.');
      return;
    }
    if (user.kycStatus !== 'verified') {
      navigate('/verify-identity');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', { listingId: id, ...dates });
      setMessage('Booking requested — the renter needs to accept it before payment.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not create the booking.');
    } finally {
      setSubmitting(false);
    }
  };
  const startChat = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post('/messages/conversations', { listingId: id });
      navigate(`/messages/${data.id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not open the chat.');
    }
  };
  
  if (!listing) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
      <div>
        <div
          style={{
            height: 320,
            borderRadius: 16,
            background: listing.images?.[0] ? `url(${listing.images[0]}) center/cover` : 'var(--ink-100)',
            marginBottom: 20,
          }}
        />
        <h1>{listing.title}</h1>
        <div style={{ marginBottom: 8 }}>
          <RatingStars rating={listing.renter?.rating} count={listing.renter?.ratingCount} />
        </div>
        <p style={{ color: 'var(--ink-500)' }}>{listing.description}</p>
      </div>

      <div className="card" style={{ height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <strong style={{ fontSize: 20 }}>₹{listing.pricePerDay}/day</strong>
          <span style={{ fontSize: 13, color: 'var(--brass-600)', fontWeight: 600 }}>
            ₹{listing.depositAmount} deposit held
          </span>
        </div>

        <form onSubmit={handleBook}>
          <div className="field">
            <label htmlFor="start">Start date</label>
            <input
              id="start"
              type="date"
              value={dates.startDate}
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="end">End date</label>
            <input
              id="end"
              type="date"
              value={dates.endDate}
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />
          </div>
          {touched && days < 1 && <div className="error-text" style={{ marginBottom: 10 }}>Pick a valid date range</div>}

          {days > 0 && (
            <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 14 }}>
              {days} day{days > 1 ? 's' : ''} · rent ₹{days * listing.pricePerDay} + ₹{listing.depositAmount} deposit
            </div>
          )}

          {message && <div className="error-text" style={{ marginBottom: 12 }}>{message}</div>}

          <button className="btn btn-brass" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Requesting…' : 'Request to book'}
          </button>
        </form>
                {(!user || user.role === 'consumer') && (
          <button className="btn btn-ghost" type="button" onClick={startChat} style={{ width: '100%', marginTop: 10 }}>
            Message renter
          </button>
        )}
      </div>
    </div>
  );
}
