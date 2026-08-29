const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    type: { type: String, enum: ['rent', 'deposit'], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['created', 'held', 'captured', 'refunded', 'partially_refunded', 'failed'],
      default: 'created',
    },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
