const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true }, // e.g. 'page_view', 'click', 'add_to_cart'
    page: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ createdAt: 1 });

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
