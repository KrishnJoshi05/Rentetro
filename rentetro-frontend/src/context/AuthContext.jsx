import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rentora_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('rentora_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    setNeedsVerification(false);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('rentora_token', data.token);
      localStorage.setItem('rentora_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err.response?.data?.needsVerification) setNeedsVerification(true);
      setError(err.response?.data?.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // No auto-login here anymore — the account needs email verification first.
  const register = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', payload);
      return data; // { message }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const { data } = await api.get(`/auth/verify-email/${token}`);
    return data;
  }, []);

  const resendVerification = useCallback(async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rentora_token');
    localStorage.removeItem('rentora_user');
    setUser(null);
  }, []);
  const updateUser = useCallback((changes) => {
  setUser((prev) => {
    const next = { ...prev, ...changes };
    localStorage.setItem('rentora_user', JSON.stringify(next));
    return next;
  });
}, []);

// On app load, refresh KYC status from the server so a stale saved copy never misleads the UI
useEffect(() => {
  if (!localStorage.getItem('rentora_token')) return;
  api
    .get('/auth/me')
    .then(({ data }) => updateUser({ kycStatus: data.kycStatus, aadhaarLast4: data.aadhaarLast4 }))
    .catch(() => {});
}, [updateUser]);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, verifyEmail, resendVerification, loading, error, needsVerification }}
    >
      {children}
      
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}