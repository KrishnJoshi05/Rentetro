const router = require('express').Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// POST /api/reviews — leave a review after a booking is settled
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ consumer: req.user._id }, { renter: req.user._id }],
      status: 'settled',
    });
    if (!booking) {
      return res.status(400).json({ message: 'Booking not found or not yet settled.' });
    }

    const reviewedUser =
      String(booking.consumer) === String(req.user._id) ? booking.renter : booking.consumer;

    const review = await Review.create({
      booking: booking._id,
      reviewer: req.user._id,
      reviewedUser,
      rating,
      comment,
    });

    // Update the reviewed user's running average rating
    const target = await User.findById(reviewedUser);
    const newCount = target.ratingCount + 1;
    target.rating = (target.rating * target.ratingCount + rating) / newCount;
    target.ratingCount = newCount;
    await target.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Failed to submit review.', error: err.message });
  }
});

module.exports = router;
