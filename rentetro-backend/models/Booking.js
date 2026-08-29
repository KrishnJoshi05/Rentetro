const mongoose = require('mongoose');

// This status enum is the single source of truth for the rental lifecycle.
// Mirror these exact string values in the frontend constants file.
const BOOKING_STATUSES = [
  'pending',    // consumer requested, awaiting renter acceptance
  'confirmed',  // renter accepted, awaiting payment
  'paid',       // rent + deposit captured/held
  'active',     // item handed over, rental in progress
  'returned',   // consumer marked return, awaiting renter confirmation
  'settled',    // renter confirmed good condition, deposit refunded
  'disputed',   // renter flagged damage or consumer disputed a deduction
  'cancelled',
];

const bookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending' },

    handoverAt: { type: Date },
    returnRequestedAt: { type: Date },
    returnConfirmedAt: { type: Date },

    damage: {
      flagged: { type: Boolean, default: false },
      description: { type: String },
      evidenceUrls: [{ type: String }],
      deductionAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
