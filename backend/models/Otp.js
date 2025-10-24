const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  type: { type: String, enum: ['email-verification', 'login', 'password-reset'], default: 'login' }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
