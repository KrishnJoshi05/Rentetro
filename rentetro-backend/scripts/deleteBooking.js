require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('MONGO_URI is required.');
  process.exit(1);
}

async function deleteBookingByEmail(email) {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    
    // Find bookings where this user is the consumer
    const bookings = await Booking.find({ consumer: user._id });
    
    if (bookings.length === 0) {
      console.log('No bookings found for this user.');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Found ${bookings.length} booking(s):`);
    bookings.forEach((b, i) => {
      console.log(`  ${i + 1}. Booking ID: ${b._id}, Status: ${b.status}, Dates: ${b.startDate} to ${b.endDate}`);
    });
    
    // Delete all bookings and related payments
    for (const booking of bookings) {
      await Payment.deleteMany({ booking: booking._id });
      await Booking.deleteOne({ _id: booking._id });
      console.log(`Deleted booking: ${booking._id}`);
    }
    
    console.log(`\n✓ Successfully deleted ${bookings.length} booking(s) from ${email}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Usage: node deleteBooking.js <email>');
  process.exit(1);
}

deleteBookingByEmail(email);
