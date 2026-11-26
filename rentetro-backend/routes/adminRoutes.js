const router = require('express').Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const { authenticate, authorize } = require('../middleware/auth');
const { decryptAadhaar } = require('../utils/aadhar');

router.use(authenticate, authorize('admin'));

// GET /api/admin/listings/pending
router.get('/listings/pending', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending' }).populate('renter', 'name email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load pending listings.', error: err.message });
  }
});

// PUT /api/admin/listings/:id/approve
router.put('/listings/:id/approve', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved' }, $unset: { rejectionReason: 1 } },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Failed to approve listing.', error: err.message });
  }
});

// Admin-only: includes the full Aadhaar number (decrypted)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password +aadhaarEncrypted');
    res.json(
      users.map((u) => {
        const obj = u.toObject();
        obj.aadhaar = u.aadhaarEncrypted ? decryptAadhaar(u.aadhaarEncrypted) : null;
        delete obj.aadhaarEncrypted;
        return obj;
      })
    );
  } catch (err) {
    res.status(500).json({ message: 'Failed to load users.', error: err.message });
  }
});
// PUT /api/admin/listings/:id/reject
router.put('/listings/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  );
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  res.json(listing);
});

// GET /api/admin/listings/approved
router.get('/listings/approved', async (req, res) => {
  const listings = await Listing.find({ status: { $in: ['approved', 'paused'] } }).populate('renter', 'name email');
  res.json(listings);
});

// PUT /api/admin/listings/:id/edit
router.put('/listings/:id/edit', async (req, res) => {
  try {
    const { title, description, category, pricePerDay, depositAmount } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { title, description, category, pricePerDay, depositAmount },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Failed to edit listing.', error: err.message });
  }
});

// DELETE /api/admin/listings/:id
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json({ message: 'Listing deleted successfully.', id: listing._id });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete listing.', error: err.message });
  }
});

// PUT /api/admin/listings/:id/pause
router.put('/listings/:id/pause', async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'paused' }, { new: true });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  res.json(listing);
});

// PUT /api/admin/listings/:id/unpause
router.put('/listings/:id/unpause', async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  res.json(listing);
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: user._id, isSuspended: user.isSuspended });
});

// PUT /api/admin/users/:id/unsuspend
router.put('/users/:id/unsuspend', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: false }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: user._id, isSuspended: user.isSuspended });
});

// GET /api/admin/disputes
router.get('/disputes', async (req, res) => {
  const disputes = await Dispute.find({ status: 'open' })
    .populate('booking')
    .populate('raisedBy', 'name email');
  res.json(disputes);
});

// PUT /api/admin/disputes/:id/resolve — splits the held deposit between the two parties
router.put('/disputes/:id/resolve', async (req, res) => {
  try {
    const { resolution, refundToConsumer, payoutToRenter } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found.' });

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.refundToConsumer = refundToConsumer;
    dispute.payoutToRenter = payoutToRenter;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await Booking.findByIdAndUpdate(dispute.booking, { status: 'settled' });

    // --- Trigger the actual split refund/payout via the payment gateway here ---
    // e.g. call gateway.refund(refundToConsumer) and gateway.payout(payoutToRenter)

    res.json(dispute);
  } catch (err) {
    res.status(400).json({ message: 'Failed to resolve dispute.', error: err.message });
  }
});

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  const [activeRentals, openDisputes, totalUsers, totalListings, capturedPayments] = await Promise.all([
    Booking.countDocuments({ status: 'active' }),
    Dispute.countDocuments({ status: 'open' }),
    User.countDocuments(),
    Listing.countDocuments({ status: 'approved' }),
    Payment.aggregate([
      { $match: { type: 'rent', status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    activeRentals,
    openDisputes,
    totalUsers,
    totalListings,
    totalRentRevenue: capturedPayments[0]?.total || 0,
  });
});

// DELETE /api/admin/bookings/:id
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    
    // Also delete related payments
    await Payment.deleteMany({ booking: booking._id });
    
    res.json({ message: 'Booking deleted successfully.', id: booking._id });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete booking.', error: err.message });
  }
});

module.exports = router;
