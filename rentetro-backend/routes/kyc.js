const router = require('express').Router();
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { isValidAadhaar, hashAadhaar, encryptAadhaar, maskAadhaar } = require('../utils/aadhar');

// Only renters and consumers go through KYC (admins are exempt)
router.use(authenticate, authorize('renter', 'consumer'));

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

// GET /api/kyc/status
router.get('/status', (req, res) => {
  res.json({ kycStatus: req.user.kycStatus, aadhaarLast4: req.user.aadhaarLast4 });
});

// POST /api/kyc/aadhaar/send-otp   { aadhaar }
router.post('/aadhaar/send-otp', async (req, res) => {
  try {
    const aadhaar = String(req.body.aadhaar || '').replace(/\s/g, '');

    if (req.user.kycStatus === 'verified') {
      return res.status(400).json({ message: 'Your identity is already verified.' });
    }
    if (!isValidAadhaar(aadhaar)) {
      return res.status(400).json({ message: 'Enter a valid 12-digit Aadhaar number.' });
    }

    const hash = hashAadhaar(aadhaar);
    const taken = await User.findOne({ aadhaarHash: hash, _id: { $ne: req.user._id } });
    if (taken) {
      return res.status(409).json({ message: 'This Aadhaar is already linked to another account.' });
    }

    const otp = String(crypto.randomInt(100000, 1000000)); // 6 digits

    const user = await User.findById(req.user._id);
    user.kycPendingHash = hash;
    user.kycPendingLast4 = aadhaar.slice(-4);
    user.kycPendingEncrypted = encryptAadhaar(aadhaar);
    user.kycOtpHash = sha256(otp);
    user.kycOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.kycOtpAttempts = 0;
    user.kycStatus = 'pending';
    await user.save();

    // MOCK: a real system sends this OTP to the phone linked with the Aadhaar,
    // through a licensed verification provider. Here we just print it.
    console.log('\n=== AADHAAR OTP (mock, nothing was sent) ===');
    console.log(`User: ${user.email}`);
    console.log(`OTP: ${otp}   (valid 10 minutes)`);
    console.log('============================================\n');

    res.json({ message: 'OTP sent to the mobile number linked with this Aadhaar.', last4: aadhaar.slice(-4) });
  } catch (err) {
    res.status(500).json({ message: 'Could not start verification.', error: err.message });
  }
});

// POST /api/kyc/aadhaar/verify-otp   { otp }
router.post('/aadhaar/verify-otp', async (req, res) => {
  try {
    const otp = String(req.body.otp || '').trim();
        const user = await User.findById(req.user._id).select('+kycOtpHash +kycPendingHash +kycPendingEncrypted');

    if (user.kycStatus !== 'pending' || !user.kycOtpHash) {
      return res.status(400).json({ message: 'Request an OTP first.' });
    }
    if (user.kycOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (user.kycOtpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many wrong attempts. Request a new OTP.' });
    }

    const matches = crypto.timingSafeEqual(Buffer.from(sha256(otp)), Buffer.from(user.kycOtpHash));
    if (!matches) {
      user.kycOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    user.aadhaarHash = user.kycPendingHash;
    user.aadhaarEncrypted = user.kycPendingEncrypted;
    user.aadhaarLast4 = user.kycPendingLast4;
    user.kycStatus = 'verified';
    user.kycVerifiedAt = new Date();
    user.kycPendingHash = undefined;
    user.kycPendingLast4 = undefined;
    user.kycPendingEncrypted = undefined;
    user.kycOtpHash = undefined;
    user.kycOtpExpires = undefined;
    await user.save();

   res.json({ message: 'Identity verified.', kycStatus: 'verified', aadhaarLast4: user.aadhaarLast4, aadhaarMasked: maskAadhaar(user.aadhaarLast4) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This Aadhaar is already linked to another account.' });
    }
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
});

module.exports = router;