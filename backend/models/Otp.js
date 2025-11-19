const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  // Either email or phone will be present depending on flow
  email: { type: String, required: false, index: true, sparse: true },
  phone: { type: String, required: false, index: true, sparse: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  type: { type: String, enum: ['email-verification', 'login', 'password-reset', 'phone-login'], default: 'login' }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
