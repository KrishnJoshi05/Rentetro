const mongoose = require('mongoose');

// One chat thread per (listing, consumer) pair, between that consumer and the listing's renter.
const conversationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    renterUnread: { type: Number, default: 0 },
    consumerUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ listing: 1, consumer: 1 }, { unique: true });
conversationSchema.index({ renter: 1, lastMessageAt: -1 });
conversationSchema.index({ consumer: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);