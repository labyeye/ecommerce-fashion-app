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
    const { items, shippingAddress, billingAddress, subtotal, shippingCost, tax, total, promoCode, evolvPointsToRedeem } = orderData;

    // Validate required fields
    if (!total || total <= 0) {
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
        size: item.size,
        color: item.color,
        total: item.itemTotal
      })),
      shippingAddress,
      billingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      payment: {
        method: 'razorpay',
        amount: total,
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
      // Create Razorpay order
      const razorpayOrderResponse = await createRazorpayOrder(
        total,
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

    // Update order with payment details
    order.payment.status = 'paid';
    order.payment.transactionId = razorpay_payment_id;
    order.payment.razorpay.paymentId = razorpay_payment_id;
    order.payment.razorpay.signature = razorpay_signature;
    order.payment.paidAt = new Date();
    order.status = 'confirmed'; // Change order status to confirmed
    
    await order.save();

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
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
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
