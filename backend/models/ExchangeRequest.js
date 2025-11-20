const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      price: { type: Number, default: 0 },
      note: String
    }
  ],
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'out_for_pickup', 'completed'],
    default: 'pending'
  },
  requestedAt: { type: Date, default: Date.now },
  handledAt: Date,
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  delhivery: {
    reverseAwb: String,
    forwardAwb: String,
    reverseRaw: mongoose.Schema.Types.Mixed,
    forwardRaw: mongoose.Schema.Types.Mixed,
    pickupScheduledAt: Date
  }
}, { timestamps: true });

exchangeRequestSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
