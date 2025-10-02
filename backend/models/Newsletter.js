const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  bannerUrl: { type: String },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  recipientsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
