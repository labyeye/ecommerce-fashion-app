#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitals_db';

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node findUser.js <email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const User = require('../models/User');
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!user) {
      console.log(JSON.stringify({ success: false, message: 'User not found', email }, null, 2));
      process.exit(0);
    }

    // Remove sensitive fields if present
    delete user.password;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    delete user.emailVerificationToken;
    delete user.emailVerificationExpires;

    console.log(JSON.stringify({ success: true, user }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err.message || err);
    process.exit(2);
  }
}

run();
