const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    desktop: {
      url: {
        type: String,
        required: [true, 'Desktop hero image URL is required']
      },
      alt: {
        type: String,
        required: [true, 'Desktop hero image alt text is required'],
        trim: true
      }
    },
    mobile: {
      url: {
        type: String,
        required: [true, 'Mobile hero image URL is required']
      },
      alt: {
        type: String,
        required: [true, 'Mobile hero image alt text is required'],
        trim: true
      }
    }
  },
  ctaButton: {
    text: {
      type: String,
      trim: true,
      maxlength: [50, 'CTA text cannot be more than 50 characters']
    },
    link: {
      type: String,
      trim: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  backgroundColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.4)',
    trim: true
  },
  textColor: {
    type: String,
    default: '#ffffff',
    trim: true
  },
  animationDuration: {
    type: Number,
    default: 4000,
    min: [1000, 'Animation duration must be at least 1000ms'],
    max: [10000, 'Animation duration cannot exceed 10000ms']
  },
  order: {
    type: Number,
    required: [true, 'Hero order is required'],
    min: [1, 'Order must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for ordering
heroSchema.index({ order: 1, isActive: 1 });

// Static method to get active heroes ordered by order field
heroSchema.statics.getActiveHeroes = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

// Pre-save middleware to ensure unique order for active heroes
heroSchema.pre('save', async function(next) {
  if (this.isModified('order') || this.isNew) {
    const Hero = this.constructor;
    
    // Check if another active hero has the same order
    const existingHero = await Hero.findOne({
      order: this.order,
      isActive: true,
      _id: { $ne: this._id }
    });
    
    if (existingHero) {
      // Increment order of existing heroes to make room
      await Hero.updateMany(
        {
          order: { $gte: this.order },
          isActive: true,
          _id: { $ne: this._id }
        },
        { $inc: { order: 1 } }
      );
    }
  }
  next();
});

module.exports = mongoose.model('Hero', heroSchema);
