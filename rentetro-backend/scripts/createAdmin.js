require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.');
  process.exit(1);
}

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.name = ADMIN_NAME;
    existing.password = ADMIN_PASSWORD;
    existing.role = 'admin';
    existing.isSuspended = false;
    await existing.save();
    console.log(`Admin account updated: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin account created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
}

createAdmin().catch(async (error) => {
  console.error('Could not create admin:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});