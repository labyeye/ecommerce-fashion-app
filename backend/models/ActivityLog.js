const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    sessionId: { type: String, required: false, index: true },
    eventType: { type: String, required: true, index: true },
    page: { type: String, required: false, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    category: { type: String, required: false },
    device: { type: String, required: false },
    browser: { type: String, required: false },
    os: { type: String, required: false },
    location: { type: String, required: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, required: false },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

// Indexes
ActivityLogSchema.index({ timestamp: 1 });
ActivityLogSchema.index({ eventType: 1 });
ActivityLogSchema.index({ userId: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
