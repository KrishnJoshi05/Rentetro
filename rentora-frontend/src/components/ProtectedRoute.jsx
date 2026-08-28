import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap a protected page: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
// Omit `roles` to just require any logged-in user.
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
