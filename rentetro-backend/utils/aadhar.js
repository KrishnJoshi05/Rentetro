const crypto = require('crypto');

// Verhoeff checksum tables (the algorithm Aadhaar numbers use)
const d = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const p = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
];

function passesVerhoeff(num) {
  let c = 0;
  const digits = String(num).split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c === 0;
}

// 12 digits, cannot start with 0 or 1, and the checksum must pass
function isValidAadhaar(aadhaar) {
  return /^[2-9][0-9]{11}$/.test(aadhaar) && passesVerhoeff(aadhaar);
}

function hashAadhaar(aadhaar) {
  if (!process.env.AADHAAR_HASH_SECRET) {
    throw new Error('AADHAAR_HASH_SECRET is not set in .env');
  }
  return crypto.createHmac('sha256', process.env.AADHAAR_HASH_SECRET).update(aadhaar).digest('hex');
}

// --- Reversible encryption (AES-256-GCM) so admins can view the full number ---
function getEncKey() {
  const hex = process.env.AADHAAR_ENC_KEY || '';
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('AADHAAR_ENC_KEY must be set in .env as 64 hex characters (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

// Returns "iv.tag.ciphertext" (each part base64)
function encryptAadhaar(aadhaar) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncKey(), iv);
  const enc = Buffer.concat([cipher.update(aadhaar, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString('base64')).join('.');
}

// Returns the 12-digit string, or null if the payload is missing/corrupt/tampered
function decryptAadhaar(payload) {
  const key = getEncKey();
  try {
    const [iv, tag, enc] = String(payload).split('.').map((part) => Buffer.from(part, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// What renters and consumers see: XXXX XXXX 1234
function maskAadhaar(last4) {
  return last4 ? `XXXX XXXX ${last4}` : null;
}

module.exports = { isValidAadhaar, hashAadhaar, encryptAadhaar, decryptAadhaar, maskAadhaar };