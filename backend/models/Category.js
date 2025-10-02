const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  image: {
    url: String,
    alt: String
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  showInNavigation: {
    type: Boolean,
    default: true
  },
  showInDropdown: {
    type: Boolean,
    default: true
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#8B7355'
  },
  icon: {
    type: String,
    default: null
  },
  seoTitle: String,
  seoDescription: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);