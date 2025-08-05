const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Promo code must be at least 3 characters long'],
    maxlength: [20, 'Promo code cannot exceed 20 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative']
  },
  maximumDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  userRestrictions: {
    newUsersOnly: {
      type: Boolean,
      default: false
    },
    loyaltyTierRequired: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', null],
      default: null
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    discountApplied: {
      type: Number,
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1 });
promoCodeSchema.index({ validFrom: 1, validUntil: 1 });
promoCodeSchema.index({ createdBy: 1 });

// Validation for date range
promoCodeSchema.pre('validate', function(next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error('Valid from date must be before valid until date'));
  }
  
  // Validate percentage discount
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  next();
});

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function(userId = null, orderValue = 0) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, reason: 'Promo code is inactive' };
  }
  
  // Check date validity
  if (now < this.validFrom) {
    return { valid: false, reason: 'Promo code is not yet valid' };
  }
  
  if (now > this.validUntil) {
    return { valid: false, reason: 'Promo code has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: 'Promo code usage limit exceeded' };
  }
  
  // Check minimum order value
  if (orderValue < this.minimumOrderValue) {
    return { 
      valid: false, 
      reason: `Minimum order value of $${this.minimumOrderValue} required` 
    };
  }
  
  // Check user usage limit if userId provided
  if (userId && this.userUsageLimit) {
    const userUsageCount = this.usageHistory.filter(
      usage => usage.user.toString() === userId.toString()
    ).length;
    
    if (userUsageCount >= this.userUsageLimit) {
      return { valid: false, reason: 'User usage limit exceeded for this promo code' };
    }
  }
  
  return { valid: true };
};

// Method to calculate discount amount
promoCodeSchema.methods.calculateDiscount = function(orderValue, items = []) {
  let applicableAmount = orderValue;
  
  // If specific products/categories are set, calculate applicable amount
  if (this.applicableProducts.length > 0 || this.applicableCategories.length > 0) {
    applicableAmount = 0;
    
    for (const item of items) {
      let itemApplicable = false;
      
      // Check if product is in applicable products
      if (this.applicableProducts.length > 0) {
        itemApplicable = this.applicableProducts.some(
          productId => productId.toString() === item.product.toString()
        );
      }
      
      // Check if product category is in applicable categories
      if (!itemApplicable && this.applicableCategories.length > 0 && item.category) {
        itemApplicable = this.applicableCategories.some(
          categoryId => categoryId.toString() === item.category.toString()
        );
      }
      
      // Check if product is excluded
      if (itemApplicable && this.excludedProducts.length > 0) {
        itemApplicable = !this.excludedProducts.some(
          productId => productId.toString() === item.product.toString()
        );
      }
      
      if (itemApplicable) {
        applicableAmount += item.total;
      }
    }
  }
  
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (applicableAmount * this.discountValue) / 100;
  } else {
    discountAmount = this.discountValue;
  }
  
  // Apply maximum discount limit if set
  if (this.maximumDiscount && discountAmount > this.maximumDiscount) {
    discountAmount = this.maximumDiscount;
  }
  
  // Ensure discount doesn't exceed applicable amount
  if (discountAmount > applicableAmount) {
    discountAmount = applicableAmount;
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Method to apply promo code to an order
promoCodeSchema.methods.applyToOrder = function(userId, orderId, discountApplied) {
  this.usageCount += 1;
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountApplied,
    usedAt: new Date()
  });
  
  return this.save();
};

// Static method to find valid promo codes
promoCodeSchema.statics.findValidCode = function(code) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  });
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
