const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        purpose: 'Test Payment for E-commerce',
        environment: 'test'
      }
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order);
    
    return {
      success: true,
      data: order
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify Razorpay payment signature
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Payment signature verification error:', error);
    return false;
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      data: payment
    };
  } catch (error) {
    console.error('Get payment details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null) => {
  try {
    const refundData = {
      payment_id: paymentId,
    };
    
    if (amount) {
      refundData.amount = amount * 100; // amount in paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return {
      success: true,
      data: refund
    };
  } catch (error) {
    console.error('Payment refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  refundPayment,
  razorpay
};
