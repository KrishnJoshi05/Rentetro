const router = require('express').Router();
const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const { authenticate } = require('../middleware/auth');

// POST /api/disputes — consumer (or renter) escalates a booking to admin review
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, reason, evidenceUrls } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ consumer: req.user._id }, { renter: req.user._id }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const dispute = await Dispute.create({
      booking: booking._id,
      raisedBy: req.user._id,
      reason,
      evidenceUrls,
      status: 'open',
    });

    booking.status = 'disputed';
    await booking.save();

    res.status(201).json(dispute);
  } catch (err) {
    res.status(400).json({ message: 'Failed to raise dispute.', error: err.message });
  }
});

// GET /api/disputes/mine — disputes involving the current user
router.get('/mine', authenticate, async (req, res) => {
  const disputes = await Dispute.find({ raisedBy: req.user._id })
    .populate('booking')
    .sort('-createdAt');
  res.json(disputes);
});

module.exports = router;
