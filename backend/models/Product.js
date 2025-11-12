const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  brand: {
    type: String,
    trim: true
  },
  // Clothing specific fields
  // Key features list for product highlights
  keyFeatures: [{
    type: String,
    trim: true
  }],
  colors: [{
    name: {
      type: String,
      required: true
    },
    hexCode: {
      type: String,
      required: true
    },
    images: [{
      url: String,
      alt: String
    }],
    // Each color can have multiple sizes (e.g., S, M, L) with their own stock and price
    sizes: [{
      size: {
        type: String,
        required: true
      },
      stock: {
        type: Number,
        default: 0,
        min: 0
      },
      price: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  // Clothing specific material and care
  material: {
    type: String,
    trim: true
  },
  careInstructions: {
    type: String,
    trim: true
  },
  minLoyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold'],
    default: 'bronze',
    required: true
  },
  // Fit and measurements
  fit: {
    type: String,
    enum: ['slim', 'regular', 'loose', 'oversized'],
    default: 'regular'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isComingSoon: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});


productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'stock.quantity': 1 });


productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});


productSchema.virtual('inStock').get(function() {
  if (!this.stock.trackStock) return true;
  return this.stock.quantity > 0;
});


productSchema.virtual('isLowStock').get(function() {
  if (!this.stock.trackStock) return false;
  return this.stock.quantity <= this.stock.lowStockThreshold && this.stock.quantity > 0;
});


productSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (!this.stock.trackStock) return;
  
  if (operation === 'decrease') {
    this.stock.quantity = Math.max(0, this.stock.quantity - quantity);
  } else if (operation === 'increase') {
    this.stock.quantity += quantity;
  }
  
  return this.save();
};


productSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};


productSchema.statics.findFeatured = function() {
  return this.find({ status: 'active', isFeatured: true });
};

module.exports = mongoose.model('Product', productSchema);
