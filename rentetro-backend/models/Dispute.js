const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    evidenceUrls: [{ type: String }],
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    resolution: { type: String }, // free-text summary of the decision
    refundToConsumer: { type: Number, default: 0 },
    payoutToRenter: { type: Number, default: 0 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
