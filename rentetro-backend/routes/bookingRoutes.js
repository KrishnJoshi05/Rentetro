const router = require('express').Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/bookings — consumer requests a booking
router.post('/', authenticate, authorize('consumer'), async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const listing = await Listing.findById(listingId);

    if (!listing || listing.status !== 'approved' || !listing.isAvailable) {
      return res.status(400).json({ message: 'Listing is not available for booking.' });
    }

    const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));

    const booking = await Booking.create({
      listing: listing._id,
      consumer: req.user._id,
      renter: listing.renter,
      startDate,
      endDate,
      rentAmount: days * listing.pricePerDay,
      depositAmount: listing.depositAmount,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create booking.', error: err.message });
  }
});

// GET /api/bookings/mine — for both renter and consumer, scoped to their side
router.get('/mine', authenticate, async (req, res) => {
  const filter =
    req.user.role === 'renter' ? { renter: req.user._id } : { consumer: req.user._id };

  const bookings = await Booking.find(filter)
    .populate('listing', 'title images')
    .populate('consumer', 'name')
    .populate('renter', 'name')
    .sort('-createdAt');

  res.json(bookings);
});

// PUT /api/bookings/:id/accept — renter accepts a pending request
router.put('/:id/accept', authenticate, authorize('renter'), async (req, res) => {
  const booking = await requireOwnedBooking(req, res, 'renter');
  if (!booking) return;
  if (booking.status !== 'pending') {
    return res.status(400).json({ message: `Cannot accept a booking in status "${booking.status}".` });
  }
  booking.status = 'confirmed';
  await booking.save();
  res.json(booking);
});

// PUT /api/bookings/:id/handover — renter marks item as handed over (after payment)
router.put('/:id/handover', authenticate, authorize('renter'), async (req, res) => {
  const booking = await requireOwnedBooking(req, res, 'renter');
  if (!booking) return;
  if (booking.status !== 'paid') {
    return res.status(400).json({ message: 'Booking must be paid before handover.' });
  }
  booking.status = 'active';
  booking.handoverAt = new Date();
  await booking.save();
  res.json(booking);
});

// PUT /api/bookings/:id/return-request — consumer marks item as returned
router.put('/:id/return-request', authenticate, authorize('consumer'), async (req, res) => {
  const booking = await requireOwnedBooking(req, res, 'consumer');
  if (!booking) return;
  if (booking.status !== 'active') {
    return res.status(400).json({ message: 'Booking is not currently active.' });
  }
  booking.status = 'returned';
  booking.returnRequestedAt = new Date();
  await booking.save();
  res.json(booking);
});

// PUT /api/bookings/:id/confirm-return — renter confirms good condition, deposit refund triggers
router.put('/:id/confirm-return', authenticate, authorize('renter'), async (req, res) => {
  const booking = await requireOwnedBooking(req, res, 'renter');
  if (!booking) return;
  if (booking.status !== 'returned') {
    return res.status(400).json({ message: 'Booking has not been returned yet.' });
  }
  booking.status = 'settled';
  booking.returnConfirmedAt = new Date();
  await booking.save();

  // TODO: trigger full deposit refund via paymentRoutes/payment service here.
  res.json(booking);
});

// PUT /api/bookings/:id/flag-damage — renter reports damage instead of confirming
router.put('/:id/flag-damage', authenticate, authorize('renter'), async (req, res) => {
  const { description, evidenceUrls, deductionAmount } = req.body;
  const booking = await requireOwnedBooking(req, res, 'renter');
  if (!booking) return;
  if (booking.status !== 'returned') {
    return res.status(400).json({ message: 'Booking has not been returned yet.' });
  }

  booking.status = 'disputed';
  booking.damage = { flagged: true, description, evidenceUrls, deductionAmount };
  await booking.save();

  // Frontend should prompt the consumer to accept the deduction or open a formal
  // dispute via POST /api/disputes, which routes it to admin review.
  res.json(booking);
});

// Helper: fetch a booking and confirm the requester owns the relevant side of it
async function requireOwnedBooking(req, res, side) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404).json({ message: 'Booking not found.' });
    return null;
  }
  const ownerId = side === 'renter' ? booking.renter : booking.consumer;
  if (String(ownerId) !== String(req.user._id)) {
    res.status(403).json({ message: 'This booking does not belong to you.' });
    return null;
  }
  return booking;
}

module.exports = router;
