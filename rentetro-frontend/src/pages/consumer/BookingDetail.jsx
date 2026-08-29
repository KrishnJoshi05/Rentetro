import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import BookingStepper from '../../components/BookingStepper';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const load = () => {
    api.get('/bookings/mine').then(({ data }) => {
      setBooking(data.find((b) => b._id === id) || null);
    });
  };

  useEffect(load, [id]);

  const pay = async () => {
    setBusy(true);
    setMessage('');
    try {
      const { data: order } = await api.post('/payments/create-order', { bookingId: id });
      // In a real integration, the gateway's checkout UI would run here and return
      // gatewayPaymentId. We simulate that success and call verify directly.
      await api.post('/payments/verify', {
        bookingId: id,
        gatewayOrderId: order.orderId,
        gatewayPaymentId: `mock_payment_${Date.now()}`,
      });
      setMessage('Payment complete. Rent captured, deposit held.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed.');
    } finally {
      setBusy(false);
    }
  };

  const requestReturn = async () => {
    setBusy(true);
    setMessage('');
    try {
      await api.put(`/bookings/${id}/return-request`);
      setMessage('Return marked — waiting for the renter to confirm condition.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not mark as returned.');
    } finally {
      setBusy(false);
    }
  };

  const submitDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await api.post('/disputes', { bookingId: id, reason: disputeReason });
      setMessage('Dispute submitted for admin review.');
      setDisputeReason('');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit dispute.');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api.post('/reviews', { bookingId: id, rating: Number(review.rating), comment: review.comment });
      setMessage('Thanks — your review was submitted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setBusy(false);
    }
  };

  if (!booking) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32, maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h1>{booking.listing?.title}</h1>
        <StatusBadge status={booking.status} />
      </div>
      <p style={{ color: 'var(--ink-500)', marginBottom: 24 }}>
        {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()} · with {booking.renter?.name}
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <BookingStepper status={booking.status} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Payment breakdown</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
          <span>Rent</span><span>₹{booking.rentAmount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span>Security deposit (held, not charged)</span><span>₹{booking.depositAmount}</span>
        </div>
      </div>

      {message && <div className="card" style={{ marginBottom: 20, color: 'var(--ink-700)' }}>{message}</div>}

      {booking.status === 'confirmed' && (
        <button className="btn btn-brass" onClick={pay} disabled={busy}>
          {busy ? 'Processing…' : `Pay ₹${booking.rentAmount + booking.depositAmount}`}
        </button>
      )}

      {booking.status === 'active' && (
        <button className="btn btn-primary" onClick={requestReturn} disabled={busy}>
          {busy ? 'Submitting…' : 'Mark item as returned'}
        </button>
      )}

      {(booking.status === 'returned' || booking.status === 'active') && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Raise a dispute</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 12 }}>
            Use this if you disagree with a deposit deduction the renter has flagged.
          </p>
          <form onSubmit={submitDispute}>
            <div className="field">
              <label htmlFor="reason">Reason</label>
              <textarea id="reason" rows={3} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
              {!disputeReason.trim() && disputeReason !== '' && <span className="error-text">Enter a reason</span>}
            </div>
            <button className="btn btn-rust" type="submit" disabled={busy}>Submit dispute</button>
          </form>
        </div>
      )}

      {booking.status === 'settled' && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Leave a review</h3>
          <form onSubmit={submitReview}>
            <div className="field">
              <label htmlFor="rating">Rating</label>
              <select id="rating" value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="comment">Comment</label>
              <textarea id="comment" rows={3} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
            </div>
            <button className="btn btn-teal" type="submit" disabled={busy}>Submit review</button>
          </form>
        </div>
      )}
    </div>
  );
}
