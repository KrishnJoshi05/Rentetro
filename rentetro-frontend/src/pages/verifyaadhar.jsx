import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = { renter: '/renter/listings', consumer: '/my-bookings' };

export default function VerifyIdentity() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(user?.kycStatus === 'verified' ? 'done' : 'enter');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (aadhaar.length !== 12) {
      setError('Aadhaar number must be 12 digits.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/kyc/aadhaar/send-otp', { aadhaar });
      setInfo(data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP.');
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/kyc/aadhaar/verify-otp', { otp });
      updateUser({ kycStatus: data.kycStatus, aadhaarLast4: data.aadhaarLast4 });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell" style={{ maxWidth: 440, paddingTop: 56 }}>
      <h1>Verify your identity</h1>

      {step === 'enter' && (
        <form className="card" onSubmit={sendOtp}>
          <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 16 }}>
            Renters and consumers must verify with Aadhaar before listing or booking. Your number is
            stored encrypted and is visible only to Rentetro admins. Everyone else sees it masked.
          </p>
          <div className="field">
            <label htmlFor="aadhaar">Aadhaar number</label>
            <input
              id="aadhaar"
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit number"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Sending…' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form className="card" onSubmit={verifyOtp}>
          <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 16 }}>
            {info} (Testing locally? The OTP is printed in your backend terminal.)
          </p>
          <div className="field">
            <label htmlFor="otp">6-digit OTP</label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-brass" type="submit" disabled={busy} style={{ width: '100%', marginBottom: 8 }}>
            {busy ? 'Verifying…' : 'Verify'}
          </button>
          <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { setStep('enter'); setOtp(''); setError(''); }}>
            Change Aadhaar number
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--teal-600)' }}>Identity verified</h2>
          <p style={{ color: 'var(--ink-500)', marginBottom: 16 }}>
            Aadhaar {user?.aadhaarLast4 ? `XXXX XXXX ${user.aadhaarLast4}` : 'XXXX XXXX ••••'} is linked to your account.
          </p>
          <button className="btn btn-primary" onClick={() => navigate(ROLE_HOME[user?.role] || '/')}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
