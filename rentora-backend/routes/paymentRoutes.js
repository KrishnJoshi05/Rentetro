const router = require('express').Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/payments/create-order — consumer pays rent + deposit for a confirmed booking
// This is a MOCK implementation. Swap the marked section for a real gateway call
// (e.g. Razorpay orders.create or Stripe paymentIntents.create with capture_method: 'manual'
// for the deposit portion, so it's authorized/held rather than charged immediately).
router.post('/create-order', authenticate, authorize('consumer'), async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId, consumer: req.user._id });

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking must be confirmed before payment.' });
    }

    // --- Real gateway integration goes here ---
    // const order = await gateway.orders.create({ amount: (booking.rentAmount + booking.depositAmount) * 100 });
    const mockOrderId = `mock_order_${Date.now()}`;

    const rentPayment = await Payment.create({
      booking: booking._id,
      type: 'rent',
      amount: booking.rentAmount,
      status: 'created',
      gatewayOrderId: mockOrderId,
    });
    const depositPayment = await Payment.create({
      booking: booking._id,
      type: 'deposit',
      amount: booking.depositAmount,
      status: 'created',
      gatewayOrderId: mockOrderId,
    });

    res.status(201).json({ orderId: mockOrderId, rentPayment, depositPayment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment order.', error: err.message });
  }
});

// POST /api/payments/verify — called after the gateway confirms payment client-side
router.post('/verify', authenticate, authorize('consumer'), async (req, res) => {
  try {
    const { bookingId, gatewayOrderId, gatewayPaymentId } = req.body;

    // --- In a real integration, verify the signature/webhook here before trusting this. ---

    // Rent is captured immediately; the deposit is only "held" (authorized) until settlement.
    await Payment.updateOne({ booking: bookingId, type: 'rent', gatewayOrderId }, { status: 'captured', gatewayPaymentId });
    await Payment.updateOne({ booking: bookingId, type: 'deposit', gatewayOrderId }, { status: 'held', gatewayPaymentId });

    const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'paid' }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed.', error: err.message });
  }
});

// POST /api/payments/refund — full or partial deposit refund (called after settlement/dispute)
router.post('/refund', authenticate, authorize('renter', 'admin'), async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const depositPayment = await Payment.findOne({ booking: bookingId, type: 'deposit' });

    if (!depositPayment) return res.status(404).json({ message: 'Deposit payment not found.' });

    // --- Real gateway refund call goes here ---
    // await gateway.payments.refund(depositPayment.gatewayPaymentId, { amount: amount * 100 });

    depositPayment.status = amount >= depositPayment.amount ? 'refunded' : 'partially_refunded';
    await depositPayment.save();

    res.json(depositPayment);
  } catch (err) {
    res.status(500).json({ message: 'Refund failed.', error: err.message });
  }
});

module.exports = router;
