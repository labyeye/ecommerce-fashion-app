const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true },
  approved: { type: Boolean, default: true }, // auto-approve for demo; change later
}, {
  timestamps: true
});

// Index for recent reviews
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
