const express = require('express');
const router = express.Router();
// simple sanitizer to prevent mongo operator injection in keys
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    const safeKey = key.replace(/\./g, '_');
    const val = obj[key];
    out[safeKey] = typeof val === 'object' && val !== null ? sanitize(val) : val;
  }
  return out;
}
const ActivityLog = require('../models/ActivityLog');
// load admin middleware if available (supports both function export or { isAdmin })
let isAdmin = (req, res, next) => next();
try {
  const adminMod = require('../middleware/adminAuth');
  if (typeof adminMod === 'function') isAdmin = adminMod;
  else if (adminMod && typeof adminMod.isAdmin === 'function') isAdmin = adminMod.isAdmin;
} catch (e) {
  // no admin middleware available, fallback to no-op
}

// helper to safely read client info
function getClientInfo(req) {
  const ua = req.get('user-agent') || '';
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return { userAgent: ua, ip };
}

// Simple in-memory list of Server-Sent-Event clients for realtime updates
const sseClients = [];

function sendSseEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch (e) {
      // remove closed client
      sseClients.splice(i, 1);
    }
  }
}

// POST /api/activity/log
router.post('/log', async (req, res) => {
  try {
    const payload = sanitize(req.body || {});
    const { eventType, page, productId, category, sessionId, metadata, userId } = payload;

    if (!eventType) {
      return res.status(400).json({ success: false, message: 'eventType is required' });
    }

    const client = getClientInfo(req);

    const doc = new ActivityLog({
      userId: userId || (req.user && req.user._id) || null,
      sessionId: sessionId || payload.sessionId || null,
      eventType: String(eventType),
      page: page ? String(page) : null,
      productId: productId || null,
      category: category || null,
      device: (metadata && metadata.device) || null,
      browser: (metadata && metadata.browser) || client.userAgent || null,
      os: (metadata && metadata.os) || null,
      location: (metadata && metadata.location) || null,
      metadata: metadata || {},
      ip: client.ip,
    });

    await doc.save();

    // broadcast to SSE clients (best-effort)
    try {
      sendSseEvent({ type: 'activity', data: { eventType: doc.eventType, page: doc.page, productId: doc.productId, timestamp: doc.timestamp } });
    } catch (e) {
      // ignore
    }
    res.json({ success: true, data: { id: doc._id } });
  } catch (err) {
    console.error('Activity log error', err);
    res.status(500).json({ success: false, message: 'Failed to log activity' });
  }
});

// SSE endpoint for realtime events: GET /api/activity/stream
router.get('/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // send a comment ping to keep connection
  res.write(': ping\n\n');

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
});

// GET /api/activity/summary - basic KPIs
router.get('/summary', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { timestamp: { $gte: since } };

    const totalEvents = await ActivityLog.countDocuments(match);
    const uniqueSessions = await ActivityLog.distinct('sessionId', match);
    const uniqueUsers = await ActivityLog.distinct('userId', match);
    const productViews = await ActivityLog.countDocuments({ ...match, eventType: 'product_view' });
    const wishlist = await ActivityLog.countDocuments({ ...match, eventType: { $in: ['wishlist_add', 'wishlist_remove'] } });
    const cart = await ActivityLog.countDocuments({ ...match, eventType: { $in: ['add_to_cart', 'remove_from_cart'] } });
    const checkoutStarted = await ActivityLog.countDocuments({ ...match, eventType: 'checkout_start' });
    const orders = await ActivityLog.countDocuments({ ...match, eventType: 'order_placed' });

    res.json({
      success: true,
      data: {
        totalEvents,
        uniqueSessions: uniqueSessions.length,
        uniqueUsers: uniqueUsers.filter(Boolean).length,
        productViews,
        wishlist,
        cart,
        checkoutStarted,
        orders,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to compute summary' });
  }
});

// GET /api/activity/graphs - returns time series aggregated by day
router.get('/graphs', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            eventType: '$eventType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.day',
          events: { $sum: '$count' },
          byType: { $push: { k: '$_id.eventType', v: '$count' } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await ActivityLog.aggregate(pipeline).allowDiskUse(true);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to build graphs' });
  }
});

// GET /api/activity/funnel - approximate funnel counts per stage
router.get('/funnel', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stages = ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'payment_succeeded', 'order_placed'];

    const counts = {};
    for (const stage of stages) {
      const distinct = await ActivityLog.distinct('sessionId', { eventType: stage, timestamp: { $gte: since } });
      counts[stage] = distinct.filter(Boolean).length;
    }

    res.json({ success: true, data: { stages, counts } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to compute funnel' });
  }
});

// GET /api/activity/heatmap - hour x weekday heatmap
router.get('/heatmap', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { timestamp: { $gte: since } } },
      {
        $project: {
          hour: { $hour: '$timestamp' },
          dayOfWeek: { $isoWeekday: '$timestamp' },
        },
      },
      { $group: { _id: { hour: '$hour', day: '$dayOfWeek' }, count: { $sum: 1 } } },
      { $sort: { '_id.day': 1, '_id.hour': 1 } },
    ];

    const result = await ActivityLog.aggregate(pipeline).allowDiskUse(true);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to compute heatmap' });
  }
});

// GET /api/activity/product-interactions - top product interactions
router.get('/product-interactions', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { timestamp: { $gte: since }, productId: { $ne: null } } },
      { $group: { _id: { productId: '$productId', eventType: '$eventType' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.productId', interactions: { $push: { k: '$_id.eventType', v: '$count' } }, total: { $sum: '$count' } } },
      { $sort: { total: -1 } },
      { $limit: 200 },
    ];

    const result = await ActivityLog.aggregate(pipeline).allowDiskUse(true);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to compute product interactions' });
  }
});

// GET /api/activity/cart-abandonment - sessions with add_to_cart but no order_placed
router.get('/cart-abandonment', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // sessions with at least one add_to_cart
    const addSessions = await ActivityLog.distinct('sessionId', { eventType: 'add_to_cart', timestamp: { $gte: since } });
    // sessions with order placed
    const orderSessions = await ActivityLog.distinct('sessionId', { eventType: 'order_placed', timestamp: { $gte: since } });

    const abandoned = addSessions.filter(s => s && !orderSessions.includes(s));

    res.json({ success: true, data: { addSessions: addSessions.length, orderSessions: orderSessions.length, abandonedCount: abandoned.length, abandonedSample: abandoned.slice(0, 50) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to compute cart abandonment' });
  }
});

// GET /api/activity/device - device usage breakdown
router.get('/device', isAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const result = await ActivityLog.aggregate(pipeline).allowDiskUse(true);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to get device data' });
  }
});

// GET /api/activity/realtime - last N events
router.get('/realtime', isAdmin, async (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit || 50));
    const docs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(limit).lean();
    res.json({ success: true, data: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to get realtime events' });
  }
});

module.exports = router;
