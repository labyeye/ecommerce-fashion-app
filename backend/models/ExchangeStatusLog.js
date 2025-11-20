const mongoose = require('mongoose');

const exchangeStatusLogSchema = new mongoose.Schema({
  exchange: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true },
  status: { type: String, required: true },
  message: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

exchangeStatusLogSchema.index({ exchange: 1, createdAt: -1 });

module.exports = mongoose.model('ExchangeStatusLog', exchangeStatusLogSchema);
