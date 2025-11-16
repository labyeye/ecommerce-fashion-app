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
  // Top-level AWB / tracking helper fields (duplicate of shipment.awb for easy querying)
  awb: { type: String },
  trackingNumber: { type: String },
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
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay'],
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
      default: 'India'
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
      default: 'India'
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

  cancellationReason: String,
  shipment: {
    awb: { type: String },
    shipmentId: { type: String },
    trackingUrl: { type: String },
    carrier: { type: String },
    status: { type: String },
    name: String,
    address: String,
    pincode: String,
    address_type: String,
    city: String,
    state: String,
    country: String,
    phone: [String],
    email: String,
    seller_name: String,
    seller_add: String,
    pickup_location: String,
    client_order_id: String,
    invoice_number: String,
    invoice_value: Number,
    weight: Number,
    shipment_height: Number,
    shipment_width: Number,
    shipment_length: Number,
    fragile_shipment: Boolean,
    dangerous_good: Boolean,
    products_desc: String,
    quantity: Number,
    total_amount: Number,
    products: [
      {
        name: String,
        qty: Number,
        price: Number,
        total: Number,
      }
    ],
    return_name: String,
    return_address: String,
    return_city: String,
    return_state: String,
    return_country: String,
    return_pin: String,
    return_phone: [String],
    rawResponse: { type: mongoose.Schema.Types.Mixed },
    lastSyncedAt: Date
  }
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
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: today }
    });
    const sequence = (orderCount + 1).toString().padStart(6, '0');
    this.orderNumber = `NSD${year}${month}${day}${sequence}`;
  }
  next();
});
orderSchema.virtual('fullShippingAddress').get(function() {
  return `${this.shippingAddress.street}, ${this.shippingAddress.city}, ${this.shippingAddress.state} ${this.shippingAddress.zipCode}, ${this.shippingAddress.country}`;
});
orderSchema.virtual('fullBillingAddress').get(function() {
  return `${this.billingAddress.street}, ${this.billingAddress.city}, ${this.billingAddress.state} ${this.billingAddress.zipCode}, ${this.billingAddress.country}`;
});
orderSchema.methods.addTimelineEntry = function(status, message, updatedBy) {
  const entry = {
    status,
    message,
    updatedBy,
    timestamp: new Date()
  };
  return this.constructor.findByIdAndUpdate(this._id, { $push: { timeline: entry } }, { new: true });
};
orderSchema.methods.updateStatus = async function(newStatus, message, updatedBy) {
  const update = { status: newStatus };
  const timelineEntry = { status: newStatus, message, updatedBy, timestamp: new Date() };

  if (newStatus === 'delivered') {
    update.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    update.cancelledAt = new Date();
    update.cancelledBy = updatedBy;
  }

  const updated = await this.constructor.findByIdAndUpdate(
    this._id,
    { $set: update, $push: { timeline: timelineEntry } },
    { new: true }
  );

  return updated;
};
orderSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).populate('items.product');
};
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer', 'firstName lastName email');
};
module.exports = mongoose.model('Order', orderSchema); 