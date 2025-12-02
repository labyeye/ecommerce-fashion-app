const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderCancellationEmail } = require('../utils/emailService');

// Simple mapping helper targeted at cancellation detection
function isCarrierStatusCancelled(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  // common carrier cancellation indicators
  return (
    s.includes('cancel') ||
    s.includes('cancelled') ||
    s.includes('rto') ||
    s.includes('rejected') ||
    s.includes('rts') ||
    s.includes('returned')
  );
}

// Protect webhook with a simple secret header if configured
function verifySecret(req) {
  const secret = process.env.DELHIVERY_WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured => accept
  const header = req.headers['x-delhivery-secret'] || req.headers['x-webhook-secret'] || req.headers['x-signature'];
  return header && String(header) === String(secret);
}

// POST /api/shipping/delhivery/webhook
router.post('/webhook', async (req, res) => {
  try {
    if (!verifySecret(req)) {
      console.warn('Delhivery webhook rejected due to missing/invalid secret');
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    const payload = req.body || {};

    // Attempt to extract AWB and status from common shapes
    let awb = null;
    let status = null;

    if (payload.awb) awb = payload.awb;
    else if (payload.data && payload.data.awb) awb = payload.data.awb;
    else if (payload.package && payload.package.awb) awb = payload.package.awb;
    else if (Array.isArray(payload.packages) && payload.packages[0] && payload.packages[0].awb) awb = payload.packages[0].awb;

    if (payload.status) status = payload.status;
    else if (payload.current_status) status = payload.current_status;
    else if (payload.data && payload.data.current_status) status = payload.data.current_status;
    else if (Array.isArray(payload.packages) && payload.packages[0] && payload.packages[0].current_status) status = payload.packages[0].current_status;

    if (!awb) {
      console.warn('Delhivery webhook received without AWB', payload);
      return res.status(400).json({ success: false, message: 'Missing AWB' });
    }

    const order = await Order.findOne({ 'shipment.awb': String(awb) }).populate('customer');
    if (!order) {
      console.warn('Delhivery webhook AWB not found in orders:', awb);
      return res.status(404).json({ success: false, message: 'Order not found for AWB' });
    }

    // store raw response and last sync
    order.shipment = order.shipment || {};
    order.shipment.status = status || order.shipment.status;
    order.shipment.rawResponse = payload;
    order.shipment.lastSyncedAt = new Date();

    // If carrier indicates cancellation, update order
    if (isCarrierStatusCancelled(status)) {
      if (String(order.status) !== 'cancelled') {
        const message = 'Shipment cancelled from Delhivery — Order auto-cancelled.';
        try {
          await order.updateStatus('cancelled', message);
        } catch (e) {
          console.error('Error updating order status to cancelled (webhook):', e);
        }

        // Send cancellation email to customer (non-blocking)
        try {
          if (order.customer && order.customer.email) {
            sendOrderCancellationEmail(order.customer.email, order.customer.firstName || '', order).catch((err) => console.error('Webhook cancellation email error:', err));
          }
        } catch (emailErr) {
          console.error('Error attempting to send cancellation email (webhook):', emailErr);
        }
      } else {
        // already cancelled
        await order.addTimelineEntry(order.status, 'Delhivery reported cancellation but order already cancelled');
      }
    } else {
      // For non-cancel events, add a carrier timeline entry
      await order.addTimelineEntry(order.status, `Delhivery webhook event: ${status || JSON.stringify(payload)}`);
    }

    await order.save();

    return res.json({ success: true, message: 'Processed' });
  } catch (err) {
    console.error('Delhivery webhook error:', err);
    return res.status(500).json({ success: false, message: 'Internal webhook error' });
  }
});

module.exports = router;
