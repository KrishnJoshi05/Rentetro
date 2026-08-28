const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String }], // image URLs (e.g. Cloudinary/S3)
    pricePerDay: { type: Number, required: true, min: 0 },
    depositAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paused'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
