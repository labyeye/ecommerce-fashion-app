const express = require("express");
const router = express.Router();
const AnalyticsEvent = require("../models/AnalyticsEvent");

// Public tracking endpoint — keep payload minimal and do not accept sensitive data
router.post("/track", async (req, res) => {
  try {
    const { event, page, meta } = req.body || {};
    if (!event)
      return res
        .status(400)
        .json({ success: false, message: "Event name required" });

    const doc = new AnalyticsEvent({
      event: String(event),
      page: page ? String(page) : null,
      meta: meta || {},
      ip: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent: req.get("User-Agent") || null,
    });
    await doc.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Track event error", err);
    res.status(500).json({ success: false, message: "Failed to record event" });
  }
});

// Optional: expose recent events (admin-friendly, can be disabled)
router.get("/events/recent", async (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const events = await AnalyticsEvent.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, events });
  } catch (err) {
    console.error("Failed to fetch events", err);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

module.exports = router;
