import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmail from './pages/VerifyEmail';
import VerifyIdentity from './pages/verifyaadhar';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingsBrowse from './pages/ListingsBrowse';
import ListingDetail from './pages/ListingDetail';

import MyBookings from './pages/consumer/MyBookings';
import BookingDetail from './pages/consumer/BookingDetail';

import MyListings from './pages/renter/MyListings';
import CreateEditListing from './pages/renter/CreateEditListing';
import IncomingBookings from './pages/renter/IncomingBookings';

import AdminDashboard from './pages/admin/AdminDashboard';
import PendingListings from './pages/admin/PendingListings';
import ApprovedListings from './pages/admin/ApprovedListings';
import UserManagement from './pages/admin/UserManagement';
import DisputeResolution from './pages/admin/DisputeResolution';

export default function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <div key={location.pathname} className="page-fade">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<ListingsBrowse />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify-aadhar" element={<VerifyIdentity />} />
          <Route path="/verify-identity" element={<VerifyIdentity />} />
                    {/* Messaging (renter + consumer) */}
          <Route path="/messages" element={<ProtectedRoute roles={['renter', 'consumer']}><Inbox /></ProtectedRoute>} />
          <Route path="/messages/:id" element={<ProtectedRoute roles={['renter', 'consumer']}><Chat /></ProtectedRoute>} />
          {/* Consumer */}
          <Route path="/my-bookings" element={<ProtectedRoute roles={['consumer']}><MyBookings /></ProtectedRoute>} />
          <Route path="/my-bookings/:id" element={<ProtectedRoute roles={['consumer']}><BookingDetail /></ProtectedRoute>} />

          {/* Renter */}
          <Route path="/renter/listings" element={<ProtectedRoute roles={['renter']}><MyListings /></ProtectedRoute>} />
          <Route path="/renter/listings/new" element={<ProtectedRoute roles={['renter']}><CreateEditListing /></ProtectedRoute>} />
          <Route path="/renter/listings/:id/edit" element={<ProtectedRoute roles={['renter']}><CreateEditListing /></ProtectedRoute>} />
          <Route path="/renter/bookings" element={<ProtectedRoute roles={['renter']}><IncomingBookings /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/listings" element={<ProtectedRoute roles={['admin']}><PendingListings /></ProtectedRoute>} />
          <Route path="/admin/listings/approved" element={<ProtectedRoute roles={['admin']}><ApprovedListings /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/disputes" element={<ProtectedRoute roles={['admin']}><DisputeResolution /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}