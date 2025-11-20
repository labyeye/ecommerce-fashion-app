const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, isAdmin, isCustomer } = require('../middleware/auth');
const Order = require('../models/Order');
const ExchangeRequest = require('../models/ExchangeRequest');
const ExchangeStatusLog = require('../models/ExchangeStatusLog');
const delhiveryService = require('../services/delhiveryService');

const router = express.Router();

// Customer creates an exchange request
router.post('/request', protect, isCustomer, [
  body('orderId').notEmpty().withMessage('orderId is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { orderId, reason, items } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only delivered orders allowed
    if (order.status !== 'delivered' && order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be exchanged' });
    }

    // Check deliveredAt exists and within 7 days
    const deliveredAt = order.deliveredAt || order.estimatedDelivery || order.updatedAt;
    if (!deliveredAt) return res.status(400).json({ success: false, message: 'Delivery date not available' });

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if ((new Date() - new Date(deliveredAt)) > sevenDays) {
      return res.status(400).json({ success: false, message: 'Exchange window (7 days) has passed' });
    }

    // Only one exchange per order
    const existing = await ExchangeRequest.findOne({ order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'An exchange request already exists for this order' });

    const reqDoc = new ExchangeRequest({
      order: order._id,
      customer: userId,
      items: items || order.items.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.price })),
      reason
    });

    await reqDoc.save();

    // Log status
    await ExchangeStatusLog.create({ exchange: reqDoc._id, status: 'pending', message: 'Request submitted by customer', createdBy: userId });

    return res.status(201).json({ success: true, data: reqDoc, message: 'Exchange request submitted' });
  } catch (err) {
    console.error('Create exchange request error:', err);
    return res.status(500).json({ success: false, message: 'Error creating exchange request' });
  }
});

// Get exchange requests for a user
router.get('/user/:id', protect, async (req, res) => {
  try {
    const userId = req.params.id;
    // only allow user or admin
    if (!(req.user.role === 'admin' || req.user._id.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const list = await ExchangeRequest.find({ customer: userId }).populate('order').populate('items.product').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    console.error('Get user exchange requests error:', err);
    return res.status(500).json({ success: false, message: 'Error fetching exchange requests' });
  }
});

// Check eligibility for an order (used by frontend to show/hide Exchange button)
router.get('/eligibility/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status !== 'delivered') return res.status(200).json({ success: true, eligible: false, reason: 'Order not delivered' });

    const deliveredAt = order.deliveredAt;
    if (!deliveredAt) return res.status(200).json({ success: true, eligible: false, reason: 'Delivery date not available' });

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const eligible = (new Date() - new Date(deliveredAt)) <= sevenDays;

    // Check if an exchange already exists
    const existing = await ExchangeRequest.findOne({ order: order._id });
    if (existing) return res.status(200).json({ success: true, eligible: false, reason: 'Exchange request already submitted' });

    return res.status(200).json({ success: true, eligible, deliveredAt });
  } catch (err) {
    console.error('Eligibility check error:', err);
    return res.status(500).json({ success: false, message: 'Error checking eligibility' });
  }
});

// Admin: get all exchange requests
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const list = await ExchangeRequest.find().populate('customer', 'firstName lastName email').populate('order').populate('items.product').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    console.error('Admin get exchanges error:', err);
    return res.status(500).json({ success: false, message: 'Error fetching exchange requests' });
  }
});

// Admin: approve exchange
router.put('/admin/approve/:id', protect, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req.user._id;
    const ex = await ExchangeRequest.findById(id).populate('order').populate('customer');
    if (!ex) return res.status(404).json({ success: false, message: 'Exchange request not found' });

    if (ex.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });

    // Update status to approved
    ex.status = 'approved';
    ex.handledAt = new Date();
    ex.handledBy = adminId;
    await ex.save();
    await ExchangeStatusLog.create({ exchange: ex._id, status: 'approved', message: 'Approved by admin', createdBy: adminId });

    // Trigger Delhivery workflows (reverse pickup + forward shipment)
    // create reverse pickup (pickup from customer back to seller)
    const reverse = await delhiveryService.createReversePickupForExchange(ex);
    if (reverse && reverse.success) {
      ex.delhivery.reverseAwb = reverse.data?.awb || reverse.awb || '';
      ex.delhivery.reverseRaw = reverse.raw || reverse;
    } else {
      ex.delhivery.reverseRaw = reverse || { success: false };
    }

    // create forward shipment for replacement (if applicable)
    const forward = await delhiveryService.createForwardShipmentForExchange(ex);
    if (forward && forward.success) {
      ex.delhivery.forwardAwb = forward.data?.awb || forward.awb || '';
      ex.delhivery.forwardRaw = forward.raw || forward;
      ex.delhivery.pickupScheduledAt = forward.pickupDate || new Date();
    } else {
      ex.delhivery.forwardRaw = forward || { success: false };
    }

    // set next status based on delhivery response
    if (ex.delhivery.reverseAwb || ex.delhivery.forwardAwb) {
      ex.status = 'out_for_pickup';
      await ExchangeStatusLog.create({ exchange: ex._id, status: 'out_for_pickup', message: 'Delhivery pickup/forward initiated', createdBy: adminId });
    }

    await ex.save();

    return res.status(200).json({ success: true, data: ex });
  } catch (err) {
    console.error('Approve exchange error:', err);
    return res.status(500).json({ success: false, message: 'Error approving exchange' });
  }
});

// Admin: reject exchange
router.put('/admin/reject/:id', protect, isAdmin, [body('reason').optional().isString()], async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req.user._id;
    const { reason } = req.body;
    const ex = await ExchangeRequest.findById(id);
    if (!ex) return res.status(404).json({ success: false, message: 'Exchange request not found' });

    if (ex.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });

    ex.status = 'rejected';
    ex.handledAt = new Date();
    ex.handledBy = adminId;
    await ex.save();
    await ExchangeStatusLog.create({ exchange: ex._id, status: 'rejected', message: reason || 'Rejected by admin', createdBy: adminId });

    return res.status(200).json({ success: true, data: ex });
  } catch (err) {
    console.error('Reject exchange error:', err);
    return res.status(500).json({ success: false, message: 'Error rejecting exchange' });
  }
});

module.exports = router;
