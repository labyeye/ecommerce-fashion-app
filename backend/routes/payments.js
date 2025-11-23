const express = require('express');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const { createRazorpayOrder, verifyPaymentSignature, getPaymentDetails } = require('../services/paymentService');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Create order and Razorpay payment order
// @route   POST /api/payments/create-order
// @access  Private (Customer)
router.post('/create-order', async (req, res) => {
  let savedOrder = null;

  try {
    const orderData = req.body;
    const { items, shippingAddress, billingAddress, promoCode, evolvPointsToRedeem } = orderData;

    // Server-side tax and total calculation (override client values)
    // Tax Calculation per requirement:
    // product selling price / 1.05 = Base amt (a)
    // Tax = base amt * 0.05 (b)
    // Shipping (c) = 100 INR (flat)
    // Total = a + b + c
    const SHIPPING_FLAT = Number(process.env.SHIPPING_FLAT || 100);
    const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD || 3000);

    let subtotalCalculated = 0; // a
    let taxCalculated = 0; // b
    // items expected to have { price, quantity }
    for (const item of items || []) {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      // base amount per unit
      const basePerUnit = price / 1.05;
      const taxPerUnit = basePerUnit * 0.05;
      subtotalCalculated += basePerUnit * qty;
      taxCalculated += taxPerUnit * qty;
    }

    // Round to 2 decimals
    subtotalCalculated = Math.round((subtotalCalculated + Number.EPSILON) * 100) / 100;
    taxCalculated = Math.round((taxCalculated + Number.EPSILON) * 100) / 100;
    const shippingCostCalculated = subtotalCalculated >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    const totalCalculated = Math.round((subtotalCalculated + taxCalculated + shippingCostCalculated + Number.EPSILON) * 100) / 100;

    // Validate required fields (use server-calculated total)
    if (!totalCalculated || totalCalculated <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order total'
      });
    }

    // Create the order first
    const newOrder = new Order({
      customer: req.user._id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: (item.size || '').toString().trim(),
        color: (item.color || '').toString().trim(),
        total: item.itemTotal
      })),
      shippingAddress,
      billingAddress,
      // Use server-calculated amounts
      subtotal: subtotalCalculated,
      shippingCost: shippingCostCalculated,
      tax: taxCalculated,
      total: totalCalculated,
      payment: {
        method: 'razorpay',
        amount: totalCalculated,
        status: 'pending',
        gateway: 'razorpay',
        currency: 'INR',
        razorpay: {}
      },
      status: 'pending',
      ...(promoCode && { promoCode }),
      evolvPointsToRedeem: evolvPointsToRedeem || 0
    });

    // Save the initial order
    savedOrder = await newOrder.save();

    try {
      // Create Razorpay order using server-calculated total
      const razorpayOrderResponse = await createRazorpayOrder(
        totalCalculated,
        'INR',
        `order_${savedOrder.orderNumber}`
      );

      if (!razorpayOrderResponse || !razorpayOrderResponse.data || !razorpayOrderResponse.data.id) {
        throw new Error('Invalid response from payment gateway');
      }

      // Update the order with Razorpay details
      savedOrder.payment.razorpay = {
        orderId: razorpayOrderResponse.data.id,
        amount: razorpayOrderResponse.data.amount,
        currency: razorpayOrderResponse.data.currency
      };
      await savedOrder.save();
      // Return success response
      return res.status(200).json({
        success: true,
        data: {
          id: razorpayOrderResponse.data.id,
          amount: razorpayOrderResponse.data.amount,
          currency: razorpayOrderResponse.data.currency,
          razorpay_key_id: process.env.RAZORPAY_KEY_ID,
          order_id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          total: savedOrder.total
        }
      });
    } catch (paymentError) {
      // If Razorpay order creation fails, delete the saved order
      if (savedOrder) {
        await Order.findByIdAndDelete(savedOrder._id);
      }
      throw new Error(`Payment gateway error: ${paymentError.message}`);
    }
  } catch (error) {
    console.error('Create payment order error:', error);
    // If the saved order exists but we reached an error, clean it up
    if (savedOrder && savedOrder._id) {
      await Order.findByIdAndDelete(savedOrder._id).catch(console.error);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private (Customer)
router.post('/verify', async (req, res) => {
  try {
    const {
      order_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    // Also accept orderId for backward compatibility
    const orderId = order_id || req.body.orderId;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);
    
    if (!paymentDetails.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }

    // Atomically update order with payment details and mark as confirmed (payment success)
    const paymentUpdate = {
      $set: {
        'payment.status': 'paid',
        'payment.transactionId': razorpay_payment_id,
        'payment.razorpay.paymentId': razorpay_payment_id,
        'payment.razorpay.signature': razorpay_signature,
        'payment.paidAt': new Date(),
        status: 'confirmed'
      }
    };

    const updatedOrderAfterPayment = await Order.findByIdAndUpdate(order._id, paymentUpdate, { new: true });
    // Decrement product stock now that payment is confirmed
    try {
      const Product = require('../models/Product');
      for (const it of updatedOrderAfterPayment.items || []) {
        try {
          // Try atomic decrement for color + size using arrayFilters
          if (it.color && it.size) {
            const updateRes = await Product.findOneAndUpdate(
              { _id: it.product, 'colors.name': it.color },
              { $inc: { 'colors.$[c].sizes.$[s].stock': -(it.quantity || 0) } },
              {
                arrayFilters: [{ 'c.name': it.color }, { 's.size': it.size }],
                new: true
              }
            );

            // If updated, ensure stock doesn't go negative (clamp)
            if (updateRes) {
              // Post-process to clamp negatives where some drivers may not support multi-positional updates
              await Product.updateOne(
                { _id: it.product, 'colors.sizes.stock': { $lt: 0 } },
                { $set: { 'colors.$[].sizes.$[s].stock': 0 } },
                { arrayFilters: [{ 's.stock': { $lt: 0 } }], multi: true }
              ).catch(() => {});
              continue;
            }
          }

          // Try atomic decrement for size-only products
          if (it.size) {
            const updateRes2 = await Product.findOneAndUpdate(
              { _id: it.product, 'sizes.size': it.size },
              { $inc: { 'sizes.$[s].stock': -(it.quantity || 0) } },
              { arrayFilters: [{ 's.size': it.size }], new: true }
            );

            if (updateRes2) {
              await Product.updateOne(
                { _id: it.product, 'sizes.stock': { $lt: 0 } },
                { $set: { 'sizes.$[s].stock': 0 } },
                { arrayFilters: [{ 's.stock': { $lt: 0 } }] }
              ).catch(() => {});
              continue;
            }
          }

          // Fallback: decrement top-level stock.quantity if present
          const fallback = await Product.findOneAndUpdate(
            { _id: it.product, 'stock.quantity': { $exists: true } },
            { $inc: { 'stock.quantity': -(it.quantity || 0) } },
            { new: true }
          );
          if (fallback && fallback.stock && fallback.stock.quantity < 0) {
            await Product.findByIdAndUpdate(it.product, { $set: { 'stock.quantity': 0 } });
          }
        } catch (decrErr) {
          console.error('Failed to decrement stock for item', it, decrErr);
        }
      }
    } catch (stockErr) {
      console.error('Error while reducing stock after payment:', stockErr);
    }

    // After confirming payment, attempt to create Delhivery shipment but do NOT throw on failure
    try {
      const { createShipmentForOrder } = require('../services/delhiveryService');
      const createRes = await createShipmentForOrder(updatedOrderAfterPayment);

      if (!createRes.success) {
        // Shipment creation failed - log and persist a timeline entry, but DO NOT fail payment
        console.error('Delhivery shipment creation failed for order', order._id, createRes.error || createRes.raw);

        // Ensure shipment.status is set to 'failed' on the order (createShipmentForOrder may have already set it)
        await Order.findByIdAndUpdate(order._id, { $set: { 'shipment.status': 'failed' } }).catch((e) => console.error('Failed to set shipment.status to failed:', e));

        // Push timeline entry describing the failure
        await Order.findByIdAndUpdate(order._id, { $push: { timeline: { status: 'shipment_creation_failed', message: `Delhivery error: ${JSON.stringify(createRes.error || createRes.raw || 'unknown')}`, updatedBy: req.user._id, timestamp: new Date() } } }).catch((e) => console.error('Failed to push timeline entry:', e));

        // Return structured JSON indicating payment success but shipment failure
        return res.status(200).json({ success: true, paymentStatus: 'success', shipmentStatus: 'failed', shipmentError: createRes.error || createRes.raw });
      }

      // Shipment created successfully
      const updatedOrder = createRes.order || (await Order.findById(order._id));
      await updatedOrder.addTimelineEntry('shipment_created', `Shipment created with AWB ${updatedOrder.shipment && (updatedOrder.shipment.waybill || updatedOrder.shipment.awb)}`);

      // Return success with AWB
      return res.status(200).json({ success: true, paymentStatus: 'success', shipmentStatus: 'created', awb: createRes.data && createRes.data.awb, order: updatedOrder });
    } catch (delErr) {
      console.error('Unexpected error while creating Delhivery shipment:', delErr);
      // Push timeline entry but still do not fail payment
      await Order.findByIdAndUpdate(order._id, { $push: { timeline: { status: 'shipment_creation_failed', message: `Delhivery error: ${delErr && delErr.message ? delErr.message : JSON.stringify(delErr)}`, updatedBy: req.user._id, timestamp: new Date() } } }).catch((e) => console.error('Failed to push timeline entry after exception:', e));
      return res.status(200).json({ success: true, paymentStatus: 'success', shipmentStatus: 'failed', shipmentError: delErr && delErr.message ? delErr.message : delErr });
    }

    // Award loyalty points on payment success (idempotent)
    try {
      if (!order.payment || !order.payment.loyaltyAwarded) {
        const customer = await User.findById(order.customer);
        if (customer) {
          // Use the instance method to compute and update points
          const result = await customer.addLoyaltyPoints(order.total, order, false);

          // Push to loyalty history (record tier points and evolv points info)
          customer.loyaltyHistory = customer.loyaltyHistory || [];
          customer.loyaltyHistory.push({
            date: new Date(),
            action: 'order_payment',
            points: result.tierPoints,
            order: order._id,
            description: `Order ${order.orderNumber} paid - ${result.tierPoints} loyalty points, ${result.evolvPoints} evolv points`
          });

          // Recalculate tier and persist customer
          customer.recalculateTier();
          await customer.save();

          // Mark order as having awarded loyalty to avoid double-award
          order.payment = order.payment || {};
          order.payment.loyaltyAwarded = true;
          await order.save();
        }
      }
    } catch (awardErr) {
      console.error('Error awarding loyalty points on payment:', awardErr);
      // proceed without failing the payment verification response
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status
        },
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        orderStatus: order.status,
        transactionId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
});

// @desc    Handle payment failure
// @route   POST /api/payments/failure
// @access  Private (Customer)
router.post('/failure', async (req, res) => {
  try {
    const { orderId, error } = req.body;

    if (!orderId) {
      return res.status(200).json({ success: false });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ success: false });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(200).json({ success: false });
    }

    // Update order payment status to failed
    order.payment.status = 'failed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status
      }
    });
  } catch (error) {
    console.error('Payment failure handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while handling payment failure'
    });
  }
});

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
// @access  Private (Customer)
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        orderStatus: order.status,
        transactionId: order.payment.transactionId,
        paidAt: order.payment.paidAt,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment status'
    });
  }
});

module.exports = router;
