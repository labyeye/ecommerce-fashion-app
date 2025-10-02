const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true },
  approved: { type: Boolean, default: true }, // auto-approve for demo; change later
}, {
  timestamps: true
});

// Index for recent reviews
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
