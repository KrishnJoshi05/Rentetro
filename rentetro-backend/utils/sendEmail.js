const crypto = require('crypto');

function generateVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}

// MOCK sender — logs the link instead of actually emailing it, so the project
// runs without needing real SMTP credentials. Swap the body of this function
// for a real provider (Nodemailer + SMTP, SendGrid, Resend, etc.) when ready.
async function sendVerificationEmail(toEmail, rawToken) {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${rawToken}`;

  console.log('\n=== EMAIL VERIFICATION (mock — no real email sent) ===');
  console.log(`To: ${toEmail}`);
  console.log(`Verify your Rentora account: ${verifyUrl}`);
  console.log('========================================================\n');

  // --- Real integration example (Nodemailer) ---
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: 587,
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // });
  // await transporter.sendMail({
  //   from: 'noreply@rentora.com',
  //   to: toEmail,
  //   subject: 'Verify your Rentora account',
  //   html: `<a href="${verifyUrl}">Click here to verify your email</a>`,
  // });
}

module.exports = { generateVerificationToken, sendVerificationEmail };