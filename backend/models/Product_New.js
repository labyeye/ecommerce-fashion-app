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
  sizes: [{
    size: {
      type: String,
      required: true // XS, S, M, L, XL, XXL
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      required: true
    }
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
    stock: {
      type: Number,
      default: 0
    }
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

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ brand: 1 });

// Virtuals
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.virtual('totalStock').get(function() {
  let total = 0;
  this.sizes.forEach(size => total += size.stock);
  return total;
});

productSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

// Methods
productSchema.methods.updateSizeStock = function(size, quantity, operation = 'decrease') {
  const sizeObj = this.sizes.find(s => s.size === size);
  if (!sizeObj) return false;
  
  if (operation === 'decrease') {
    sizeObj.stock = Math.max(0, sizeObj.stock - quantity);
  } else if (operation === 'increase') {
    sizeObj.stock += quantity;
  }
  
  return this.save();
};

// Statics
productSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

productSchema.statics.findFeatured = function() {
  return this.find({ status: 'active', isFeatured: true });
};

productSchema.statics.findNewArrivals = function() {
  return this.find({ status: 'active', isNewArrival: true });
};

productSchema.statics.findBestSellers = function() {
  return this.find({ status: 'active', isBestSeller: true });
};

module.exports = mongoose.model('Product', productSchema);
