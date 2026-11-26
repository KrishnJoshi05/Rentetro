const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['admin', 'renter', 'consumer'],
      default: 'consumer',
    },
        isSuspended: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
        kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    aadhaarLast4: { type: String },
    aadhaarHash: { type: String, unique: true, sparse: true, select: false },
    aadhaarEncrypted: { type: String, select: false },
    kycPendingHash: { type: String, select: false },
    kycPendingEncrypted: { type: String, select: false },
    kycPendingLast4: { type: String },
    kycOtpHash: { type: String, select: false },
    kycOtpExpires: { type: Date },
    kycOtpAttempts: { type: Number, default: 0 },
    kycVerifiedAt: { type: Date },
    rating: { type: Number, default: 0 }, // average rating as a renter
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
