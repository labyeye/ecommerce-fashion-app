const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // In Order.js, update the items schema:
items: [{
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  variant: {
    name: String,
    value: String
  }
}],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    trackingNumber: String,
    carrier: String
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'evolv_points'],
      default: 'fixed'
    },
    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode'
    },
    evolvPointsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Evolv points used cannot be negative']
    }
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery', 'razorpay'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    // Razorpay specific fields
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal', 'manual'],
      default: 'razorpay'
    },
    amount: {
      type: Number,
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'USA'
    }
  },
  billingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'USA'
    }
  },
  notes: {
    customer: String,
    admin: String
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  cancellationReason: String
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('validate', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders for today
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: today }
    });
    
    const sequence = (orderCount + 1).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${sequence}`;
  }
  next();
});
// Virtual for full shipping address
orderSchema.virtual('fullShippingAddress').get(function() {
  return `${this.shippingAddress.street}, ${this.shippingAddress.city}, ${this.shippingAddress.state} ${this.shippingAddress.zipCode}, ${this.shippingAddress.country}`;
});

// Virtual for full billing address
orderSchema.virtual('fullBillingAddress').get(function() {
  return `${this.billingAddress.street}, ${this.billingAddress.city}, ${this.billingAddress.state} ${this.billingAddress.zipCode}, ${this.billingAddress.country}`;
});

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, message, updatedBy) {
  this.timeline.push({
    status,
    message,
    updatedBy
  });
  return this.save();
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, message, updatedBy) {
  this.status = newStatus;
  this.addTimelineEntry(newStatus, message, updatedBy);
  
  // Set specific timestamps based on status
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  return this.save();
};

// Static method to find orders by customer
orderSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).populate('items.product');
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer', 'firstName lastName email');
};


module.exports = mongoose.model('Order', orderSchema); 