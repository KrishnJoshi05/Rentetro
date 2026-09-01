import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('checking'); // checking | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail(token)
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="app-shell" style={{ maxWidth: 420, paddingTop: 56 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        {status === 'checking' && <p>Verifying your email…</p>}
        {status === 'success' && (
          <>
            <h2>Email verified</h2>
            <p style={{ color: 'var(--ink-500)', marginBottom: 16 }}>{message}</p>
            <Link to="/login" className="btn btn-primary">Log in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Verification failed</h2>
            <p className="error-text" style={{ marginBottom: 16 }}>{message}</p>
            <Link to="/login" className="btn btn-ghost">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}