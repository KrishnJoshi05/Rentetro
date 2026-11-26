const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user document to req.user
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    if (user.isSuspended) return res.status(403).json({ message: 'Account suspended.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Usage: authorize('admin') or authorize('renter', 'admin')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this.' });
    }
    next();
  };
}


// Blocks users who haven't completed Aadhaar verification (admins pass through)
function requireKyc(req, res, next) {
  if (req.user.role === 'admin' || req.user.kycStatus === 'verified') return next();
  return res.status(403).json({
    message: 'Verify your identity with Aadhaar before doing this.',
    needsKyc: true,
  });
}
module.exports = { authenticate, authorize, requireKyc };