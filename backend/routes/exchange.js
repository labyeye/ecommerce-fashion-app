const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, isAdmin, isCustomer } = require('../middleware/auth');
const Order = require('../models/Order');
const ExchangeRequest = require('../models/ExchangeRequest');
const ExchangeStatusLog = require('../models/ExchangeStatusLog');
const delhiveryService = require('../services/delhiveryService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'exchange');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, safe);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Customer creates an exchange request (supports image uploads)
router.post('/request', protect, isCustomer, upload.array('images', 5), async (req, res) => {
  try {
    const { orderId, reason, items } = req.body;
    const userId = req.user._id;

    if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });
    if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Allow exchanges for 7 days from order creation date
    const orderDate = order.createdAt || order._id.getTimestamp ? order._id.getTimestamp() : null;
    if (!orderDate && !order.createdAt) return res.status(400).json({ success: false, message: 'Order date not available' });
    const createdAt = order.createdAt || orderDate;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if ((new Date() - new Date(createdAt)) > sevenDays) {
      return res.status(400).json({ success: false, message: 'Exchange window (7 days from order date) has passed' });
    }

    // Only one exchange per order
    const existing = await ExchangeRequest.findOne({ order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'An exchange request already exists for this order' });

    const images = (req.files || []).map(f => `/uploads/exchange/${f.filename}`);

    const reqDoc = new ExchangeRequest({
      order: order._id,
      customer: userId,
      items: items ? JSON.parse(items) : order.items.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.price })),
      reason,
      images
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
// Eligibility is 7 days from order creation date
router.get('/eligibility/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const createdAt = order.createdAt || (order._id && order._id.getTimestamp ? order._id.getTimestamp() : null);
    if (!createdAt) return res.status(200).json({ success: true, eligible: false, reason: 'Order date not available' });

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const eligible = (new Date() - new Date(createdAt)) <= sevenDays;

    // Check if an exchange already exists
    const existing = await ExchangeRequest.findOne({ order: order._id });
    if (existing) return res.status(200).json({ success: true, eligible: false, reason: 'Exchange request already submitted' });

    return res.status(200).json({ success: true, eligible, createdAt });
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
